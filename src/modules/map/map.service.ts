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

    const cacheKey = `map:${roundedWest}:${roundedSouth}:${roundedEast}:${roundedNorth}:${zoom}`;
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

  async getTile({ z, x, y }: { z: number; x: number; y: number }) {
    const tableName = Prisma.raw(`"${DB_EARTHQUAKE_NAME}"`);

    const result = await this.prisma.$queryRaw<
      [{ st_asmvt: Buffer }]
    >(Prisma.sql`
  SELECT ST_AsMVT(q, 'earthquakes', 4096, 'geom')
  FROM (
    SELECT
      id,
      magnitude,
      depth,
      location,
      "occurredAt",
      ST_AsMVTGeom(
        geom_3857,
        ST_TileEnvelope(${z}, ${x}, ${y}),
        4096,
        256,
        true
      ) AS geom
    FROM ${tableName}
    WHERE geom_3857 && ST_TileEnvelope(${z}, ${x}, ${y})
      AND ST_Intersects(
            geom_3857,
            ST_TileEnvelope(${z}, ${x}, ${y})
          )
  ) AS q
  WHERE geom IS NOT NULL;
`);

    const raw = result[0]?.st_asmvt;

    if (!raw) return null;

    return Buffer.from(raw);
  }
}
