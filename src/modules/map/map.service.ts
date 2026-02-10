import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
import { GetMapDto } from "./dto/get-map.dto";

const MAX_LIMIT = 200_000;

function getLimitByZoom(zoom?: number): number {
  if (zoom === undefined) return MAX_LIMIT;

  if (zoom <= 4) return 50_000;
  if (zoom <= 6) return 100_000;
  if (zoom <= 8) return 150_000;

  return MAX_LIMIT;
}

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async getMap(dto: GetMapDto) {
    const { west, south, east, north, zoom } = dto;
    const limit = getLimitByZoom(zoom);

    const [data, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<
        {
          id: number;
          magnitude: number;
          depth: number;
          latitude: number;
          longitude: number;
          location: string | null;
          occuredAt: Date;
        }[]
      >(
        `
        SELECT id, magnitude, depth, latitude, longitude, location, "occuredAt"
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

    return {
      data,
      total: Number(countResult[0].count),
      limit,
    };
  }
}
