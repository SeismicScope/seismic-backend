import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Response } from "express";

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

  @Get("/dashboard")
  @ApiOperation({
    summary: "Get earthquake points within map bounds for dashboard",
  })
  @ApiOkResponse({ type: MapResponseDto })
  async getDashboardData(@Query() query: GetMapDto) {
    return this.mapService.getMap(query, true);
  }

  @SkipThrottle()
  @Get("tiles/:z/:x/:y")
  async getTile(
    @Param("z") z: number,
    @Param("x") x: number,
    @Param("y") y: number,
    @Res() res: Response,
  ) {
    const tile = await this.mapService.getTile({ z: +z, x: +x, y: +y });

    res.setHeader("Content-Type", "application/vnd.mapbox-vector-tile");
    res.setHeader("Content-Encoding", "identity");
    res.setHeader("Cache-Control", "public, max-age=60");

    if (!tile) {
      return res.status(204).send();
    }
    res.end(tile);
  }
}
