import { Module } from "@nestjs/common";

import { PrismaService } from "../../../prisma/prisma.service";
import { MapController } from "./map.controller";
import { MapService } from "./map.service";

@Module({
  imports: [PrismaService],
  controllers: [MapController],
  providers: [MapService],
})
export class MapModule {}
