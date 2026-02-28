import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PrismaModule } from "prisma/prisma.module";

import { ShortenerController } from "./shortener.controller";
import { ShortenerService } from "./shortener.service";

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({ name: "shortener-cleanup" }),
  ],
  controllers: [ShortenerController],
  providers: [ShortenerService],
})
export class ShortenerModule {}
