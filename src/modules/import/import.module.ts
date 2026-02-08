import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

import { AuthModule } from "../auth/auth.module";
import { ImportController } from "./import.controller";
import { ImportService } from "./import.service";

@Module({
  controllers: [ImportController],
  providers: [ImportService],
  imports: [
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
