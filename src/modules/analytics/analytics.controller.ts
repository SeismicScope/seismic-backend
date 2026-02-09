import { Controller, Get, Query } from "@nestjs/common";

import { GetEarthquakesDto } from "@/modules/earthquakes/dto/get-earthquakes.dto";

import { AnalyticsService } from "./analytics.service";
import { TimeSeriesDto } from "./dto/time-series.dto";

@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("time-series")
  async timeSeries(@Query() query: TimeSeriesDto) {
    return this.analyticsService.timeSeries(query);
  }

  @Get("stats")
  async getEarthquakesStats(@Query() query: GetEarthquakesDto) {
    return this.analyticsService.getEarthquakesStats(query);
  }
}
