import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

import type { MapEarthquake } from "@/types";

import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
import { RedisService } from "../redis/redis.service";
import { GetMapDto } from "./dto/get-map.dto";
import { getLimitByZoom, getPercision, roundCoord } from "./helpers";

const MAP_TTL = 60; // 1 minute (map data changes with viewport)

@Injectable()
export class MapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getMap(dto: GetMapDto) {
    const { west, south, east, north, zoom = 4 } = dto;
    const limit = getLimitByZoom(zoom);
    const precision = getPercision(zoom);
    const roundedWest = roundCoord(west, precision);
    const roundedSouth = roundCoord(south, precision);
    const roundedEast = roundCoord(east, precision);
    const roundedNorth = roundCoord(north, precision);

    const cacheKey = `map:${roundedWest}:${roundedSouth}:${roundedEast}:${roundedNorth}`;
    const cached = await this.redis.get<{
      data: MapEarthquake[];
      total: number;
      limit: number;
    }>(cacheKey);

    if (cached) return cached;

    const tableName = Prisma.raw(`"${DB_EARTHQUAKE_NAME}"`);

    const [data, countResult] = await Promise.all([
      this.prisma.$queryRaw<MapEarthquake[]>(Prisma.sql`
        SELECT id, magnitude, depth, latitude, longitude, location, "occurredAt"
        FROM ${tableName}
        WHERE geom && ST_MakeEnvelope(
          ${roundedWest},
          ${roundedSouth},
          ${roundedEast},
          ${roundedNorth},
          ${SRID}
        )
        ORDER BY "occurredAt" DESC
        LIMIT ${limit}
      `),
      this.prisma.$queryRaw<[{ count: bigint }]>(Prisma.sql`
        SELECT COUNT(*) as count
        FROM ${tableName}
        WHERE geom && ST_MakeEnvelope(
          ${roundedWest},
          ${roundedSouth},
          ${roundedEast},
          ${roundedNorth},
          ${SRID}
      )
      `),
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
