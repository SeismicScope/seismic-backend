import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { PrismaService } from "prisma/prisma.service";

@Processor("shortener-cleanup")
export class ShortenerCleanupProcessor extends WorkerHost {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(_job: Job): Promise<void> {
    await this.prisma.shortLink.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }
}
