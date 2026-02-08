import { Controller, Get, Query } from "@nestjs/common";

import { GetMapDto } from "./dto/get-map.dto";
import { MapService } from "./map.service";

@Controller("map")
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  async getMapData(@Query() query: GetMapDto) {
    return this.mapService.getMap(query);
  }
}
