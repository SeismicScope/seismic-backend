import { Module } from "@nestjs/common";

import { PrismaModule } from "../../../prisma/prisma.module";
import { EarthquakesController } from "./earthquakes.controller";
import { EarthquakesService } from "./earthquakes.service";

@Module({
  imports: [PrismaModule],
  controllers: [EarthquakesController],
  providers: [EarthquakesService],
})
export class EarthquakesModule {}
