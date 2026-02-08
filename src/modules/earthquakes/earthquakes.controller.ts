import { Controller, Get, Query } from "@nestjs/common";

import type { GetEarthquakesDto } from "./dto/get-earthquakes.dto";
import { EarthquakesService } from "./earthquakes.service";

@Controller("earthquakes")
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  async getEarthquakes(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakes(query);
  }
}
