import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";

import { GetEarthquakesDto } from "./dto/get-earthquakes.dto";
import { EarthquakesService } from "./earthquakes.service";

@Controller("earthquakes")
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  async getEarthquakes(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakes(query);
  }

  @Get(":id")
  async getEarthquakeById(@Param("id", ParseIntPipe) id: number) {
    return this.earthquakesService.getEarthquakeById(id);
  }

  @Get("magnitude-histogram")
  async getEarthquakesMagnitudeHistogram(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakesMagnitudeHistogram(query);
  }
}
