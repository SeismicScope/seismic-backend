import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Prisma, PrismaClient } from "@prisma/client";
import { Job } from "bullmq";
import csv from "csv-parser";
import * as fs from "fs";

import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
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
      UPDATE ${Prisma.raw(DB_EARTHQUAKE_NAME)}
      SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), ${SRID}) 
      WHERE geom IS NULL
    `);

    return { success: true };
  }
}
