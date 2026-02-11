import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetEarthquakesDto } from "./dto/get-earthquakes.dto";
import { EarthquakesService } from "./earthquakes.service";

@ApiTags("Earthquakes")
@Controller("earthquakes")
export class EarthquakesController {
  constructor(private readonly earthquakesService: EarthquakesService) {}

  @Get()
  @ApiOperation({ summary: "Get paginated list of earthquakes with filters" })
  async getEarthquakes(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakes(query);
  }

  @Get("magnitude-histogram")
  @ApiOperation({ summary: "Get magnitude distribution histogram" })
  async getEarthquakesMagnitudeHistogram(@Query() query: GetEarthquakesDto) {
    return this.earthquakesService.getEarthquakesMagnitudeHistogram(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single earthquake by ID" })
  async getEarthquakeById(@Param("id", ParseIntPipe) id: number) {
    return this.earthquakesService.getEarthquakeById(id);
  }
}
