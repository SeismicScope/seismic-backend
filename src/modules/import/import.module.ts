import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { join } from "path";

import { ImportController } from "./import.controller";
import { ImportService } from "./import.servise";

@Module({
  controllers: [ImportController],
  providers: [ImportService],
  imports: [
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
