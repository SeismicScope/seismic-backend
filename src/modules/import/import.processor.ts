import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import csv from "csv-parser";
import * as fs from "fs";

import { PrismaService } from "../../../prisma/prisma.service";
import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
import { transformRow } from "./helpers";

const BATCH_SIZE = 5000;

@Processor("import-earthquakes", { concurrency: 1, lockDuration: 600000 })
export class ImportProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<{ filePath: string; jobId: number }>): Promise<any> {
    const { filePath, jobId } = job.data;
    const stream = fs.createReadStream(filePath).pipe(csv());

    let batch: any[] = [];
    let processedCount = 0;

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { status: "processing" },
    });

    try {
      for await (const row of stream) {
        batch.push(transformRow(row));

        if (batch.length === BATCH_SIZE) {
          await this.processBatch({
            batch,
            jobId,
            currentTotal: processedCount + batch.length,
          });
          processedCount += batch.length;
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

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      await this.prisma.importJob.update({
        where: { id: jobId },
        data: { status: "failed" },
      });
      throw error;
    }

    return { success: true, total: processedCount };
  }

  private async processBatch({
    batch = [],
    jobId,
    currentTotal,
  }: {
    batch: any[];
    jobId: number;
    currentTotal: number;
  }) {
    await this.prisma.$transaction(async (tx) => {
      await tx.earthquake.createMany({ data: batch });

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
