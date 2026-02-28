import { Module } from "@nestjs/common";
import { PrismaModule } from "prisma/prisma.module";

import { ShortenerController } from "./shortener.controller";
import { ShortenerService } from "./shortener.service";

@Module({
  imports: [PrismaModule],
  controllers: [ShortenerController],
  providers: [ShortenerService],
})
export class ShortenerModule {}
