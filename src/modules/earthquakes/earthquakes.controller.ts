import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { PaginatedResponseDto } from "@/dto/paginated-response.dto";
import { HistogramPointDto } from "@/modules/analytics/dto/analytics-response.dto";

import { EarthquakeResponseDto } from "./dto/earthquake-response.dto";
import { GetEarthquakesDto } from "./dto/get-earthquakes.dto";
import { EarthquakesService } from "./earthquakes.service";

@ApiTags("Earthquakes")
@Controller("earthquakes")
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  @ApiOperation({ summary: "Get paginated list of earthquakes with filters" })
  @ApiOkResponse({ type: PaginatedResponseDto<EarthquakeResponseDto> })
  async getEarthquakes(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakes(query);
  }

  @Get("magnitude-histogram")
  @ApiOperation({ summary: "Get magnitude distribution histogram" })
  @ApiOkResponse({ type: [HistogramPointDto] })
  async getEarthquakesMagnitudeHistogram(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakesMagnitudeHistogram(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single earthquake by ID" })
  @ApiOkResponse({ type: EarthquakeResponseDto })
  async getEarthquakeById(@Param("id", ParseIntPipe) id: number) {
    return this.earthquakesService.getEarthquakeById(id);
  }
}
