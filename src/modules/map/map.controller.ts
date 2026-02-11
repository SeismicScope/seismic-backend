import { Controller, Get, Query } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetMapDto } from "./dto/get-map.dto";
import { MapService } from "./map.service";

@ApiTags("Map")
@Controller("map")
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  @ApiOperation({ summary: "Get earthquake points within map bounds" })
  async getMapData(@Query() query: GetMapDto) {
    return this.mapService.getMap(query);
  }
}
