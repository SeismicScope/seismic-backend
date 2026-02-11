import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetEarthquakesDto } from "@/modules/earthquakes/dto/get-earthquakes.dto";

import { AnalyticsService } from "./analytics.service";
import { TimeSeriesDto } from "./dto/time-series.dto";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("time-series")
  @ApiOperation({ summary: "Get earthquake count time-series by interval" })
  async timeSeries(@Query() query: TimeSeriesDto) {
    return this.analyticsService.timeSeries(query);
  }

  @Get("stats")
  @ApiOperation({
    summary: "Get aggregate earthquake statistics (count, avg, max)",
  })
  async getEarthquakesStats(@Query() query: GetEarthquakesDto) {
    return this.analyticsService.getEarthquakesStats(query);
  }
}
