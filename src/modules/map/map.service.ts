import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import type { MapEarthquake } from "@/types";

import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
import { RedisService } from "../redis/redis.service";
import { GetMapDto } from "./dto/get-map.dto";
import { getLimitByZoom } from "./helpers";

const MAP_TTL = 60; // 1 minute (map data changes with viewport)

@Injectable()
export class MapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getMap(dto: GetMapDto) {
    const { west, south, east, north, zoom } = dto;
    const limit = getLimitByZoom(zoom);

    const cacheKey = `map:${west}:${south}:${east}:${north}:${zoom}`;
    const cached = await this.redis.get<{
      data: MapEarthquake[];
      total: number;
      limit: number;
    }>(cacheKey);

    if (cached) return cached;

    const [data, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<MapEarthquake[]>(
        `
        SELECT id, magnitude, depth, latitude, longitude, location, "occurredAt"
        FROM "${DB_EARTHQUAKE_NAME}"
        WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, $5)
        LIMIT $6;
      `,
        west,
        south,
        east,
        north,
        SRID,
        limit,
      ),
      this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
        `
        SELECT COUNT(*) as count
        FROM "${DB_EARTHQUAKE_NAME}"
        WHERE geom && ST_MakeEnvelope($1, $2, $3, $4, $5);
      `,
        west,
        south,
        east,
        north,
        SRID,
      ),
    ]);

    const result = {
      data,
      total: Number(countResult[0].count),
      limit,
    };

    await this.redis.set(cacheKey, result, MAP_TTL);

    return result;
  }
}
