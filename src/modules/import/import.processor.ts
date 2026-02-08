import { Processor, WorkerHost } from "@nestjs/bullmq";
import { PrismaClient } from "@prisma/client";
import { Job } from "bullmq";
import csv from "csv-parser";
import * as fs from "fs";

import { transformRow } from "./helpers";

const BATCH_SIZE = 1000;
const WORKERS = 1;

@Processor("import-earthquakes", { concurrency: WORKERS, lockDuration: 300000 })
export class ImportProcessor extends WorkerHost {
  private prisma = new PrismaClient();

  async process(job: Job<any, any, string>): Promise<any> {
    const { filePath } = job.data;
    const stream = fs.createReadStream(filePath).pipe(csv());
    let batch = [];

    for await (const row of stream) {
      batch.push(transformRow(row));

      if (batch.length === BATCH_SIZE) {
        await this.prisma.earthquake.createMany({ data: batch });
        batch = [];
      }
    }

    if (batch.length > 0) {
      await this.prisma.earthquake.createMany({ data: batch });
    }

    await this.prisma.$executeRawUnsafe(`
      UPDATE "Earthquake" 
      SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) 
      WHERE geom IS NULL
    `);

    return { success: true };
  }
}
