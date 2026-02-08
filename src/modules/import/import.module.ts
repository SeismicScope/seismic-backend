import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { PrismaModule } from "../../../prisma/prisma.module";
import { AuthModule } from "../auth/auth.module";
import { ImportController } from "./import.controller";
import { ImportProcessor } from "./import.processor";
import { ImportService } from "./import.service";

@Module({
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor],
  imports: [
    PrismaModule,
    AuthModule,
    BullModule.registerQueue({
      name: "import-earthquakes",
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: true,
      },
    }),
  ],
})
export class ImportModule {}
