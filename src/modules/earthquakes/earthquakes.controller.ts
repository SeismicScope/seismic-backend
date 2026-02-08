import { Controller, Get, Query } from "@nestjs/common";

import { GetEarthquakesDto } from "./dto/get-earthquakes.dto";
import { EarthquakesService } from "./earthquakes.service";

@Controller("earthquakes")
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  async getEarthquakes(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakes(query);
  }

  @Get("stats")
  async getEarthquakesStats() {
    return this.earthquakesService.getEarthquakesStats();
  }

  @Get("magnitude-histogram")
  async getEarthquakesMagnitudeHistogram() {
    return this.earthquakesService.getEarthquakesMagnitudeHistogram();
  }
}
