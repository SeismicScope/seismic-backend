import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import { Queue } from "bullmq";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class ImportService {
  constructor(
    @InjectQueue("import-earthquakes") private readonly earthquakeQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async createImport(filePath: string, fileName: string) {
    const dbJob = await this.prisma.importJob.create({
      data: {
        fileName,
        status: "queued",
        processed: 0,
      },
    });

    await this.earthquakeQueue.add("import", {
      jobId: dbJob.id,
      filePath,
    });

    return dbJob;
  }

  async updateStatus(
    id: number,
    data: { status?: string; processed?: number },
  ) {
    return this.prisma.importJob.update({
      where: { id },
      data,
    });
  }

  async getImportStatus(id: number) {
    return this.prisma.importJob.findUnique({
      where: { id },
    });
  }
}
