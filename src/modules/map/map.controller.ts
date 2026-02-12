import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetMapDto } from "./dto/get-map.dto";
import { MapResponseDto } from "./dto/map-response.dto";
import { MapService } from "./map.service";

@ApiTags("Map")
@Controller("map")
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  @ApiOperation({ summary: "Get earthquake points within map bounds" })
  @ApiOkResponse({ type: MapResponseDto })
  async getMapData(@Query() query: GetMapDto) {
    return this.mapService.getMap(query);
  }
}
