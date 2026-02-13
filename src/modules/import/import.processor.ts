import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import csv from "csv-parser";
import * as fs from "fs";
import { PrismaService } from "prisma/prisma.service";

import type { TransformedEarthquakeRow } from "@/types";

import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
import { MetricsService } from "../metrics/metrics.service";
import { RedisService } from "../redis/redis.service";
import { transformRow } from "./helpers";

const BATCH_SIZE = 5000;

@Processor("import-earthquakes", { concurrency: 1, lockDuration: 600000 })
export class ImportProcessor extends WorkerHost {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly redis: RedisService,
  ) {
    super();
  }

  async process(job: Job<{ filePath: string; jobId: number }>) {
    const { filePath, jobId } = job.data;

    this.logger.log(`Worker started processing file: ${filePath}`);
    const startTime = process.hrtime.bigint();

    if (!fs.existsSync(filePath)) {
      this.logger.error(`File not found: ${filePath}`);
      throw new Error(`File not found: ${filePath}`);
    }

    const stream = fs.createReadStream(filePath).pipe(
      csv({
        separator: ",",
        strict: false,
        mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").trim(),
      }),
    );

    let batch: TransformedEarthquakeRow[] = [];
    let processedCount = 0;

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: "processing" },
    });

    try {
      for await (const row of stream) {
        const transformed = transformRow(row);

        if (transformed) {
          batch.push(transformed);
        }

        if (batch.length === BATCH_SIZE) {
          await this.processBatch({
            batch,
            jobId,
            currentTotal: processedCount + batch.length,
          });

          processedCount += batch.length;

          this.logger.log(
            `Processed ${processedCount} rows so far (jobId=${jobId})`,
          );

          batch = [];
        }
      }

      if (batch.length > 0) {
        await this.processBatch({
          batch,
          jobId,
          currentTotal: processedCount + batch.length,
        });

        processedCount += batch.length;
      }

      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { status: "completed", processed: processedCount },
      });

      await Promise.all([
        this.redis.del("stats:*"),
        this.redis.del("histogram:*"),
      ]);

      this.metrics.importRowsProcessed.inc(processedCount);
      this.metrics.importDuration
        .labels("completed")
        .observe(Number(process.hrtime.bigint() - startTime) / 1_000_000_000);

      this.logger.log(
        `Import finished successfully. Total rows: ${processedCount} (jobId=${jobId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing file (jobId=${jobId})`,
        error instanceof Error ? error.stack : String(error),
      );

      this.metrics.importDuration
        .labels("failed")
        .observe(Number(process.hrtime.bigint() - startTime) / 1_000_000_000);

      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { status: "failed" },
      });

      throw error;
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.debug(`Temporary file removed: ${filePath}`);
      }
    }

    return { success: true, total: processedCount };
  }

  private async processBatch({
    batch,
    jobId,
    currentTotal,
  }: {
    batch: TransformedEarthquakeRow[];
    jobId: number;
    currentTotal: number;
  }) {
    await this.prisma.$transaction(async (tx) => {
      this.metrics.importBatchSize.observe(batch.length);

      await tx.earthquake.createMany({
        data: batch,
        skipDuplicates: true,
      });

      await tx.$executeRawUnsafe(`
        UPDATE "${DB_EARTHQUAKE_NAME}"
        SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), ${SRID}) 
        WHERE geom IS NULL
      `);
    });

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { processed: currentTotal },
    });
  }
}
