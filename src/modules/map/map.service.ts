import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
import { GetMapDto } from "./dto/get-map.dto";

const MAX_LIMIT = 50_000;

function getLimitByZoom(zoom?: number): number {
  if (zoom === undefined) return MAX_LIMIT;

  if (zoom <= 4) return 5_000;
  if (zoom <= 5) return 10_000;
  if (zoom <= 6) return 15_000;
  if (zoom <= 7) return 20_000;
  if (zoom <= 8) return 30_000;
  if (zoom <= 9) return 40_000;

  return MAX_LIMIT;
}

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async getMap(dto: GetMapDto) {
    const { west, south, east, north, zoom } = dto;
    const limit = getLimitByZoom(zoom);

    const data = await this.prisma.$queryRawUnsafe(
      `
      SELECT id, "externalId", "occuredAt", magnitude, depth, latitude, longitude, location, "createdAt"
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
    );

    const total = await this.prisma.$queryRawUnsafe<[{ count: bigint }]>(
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
    );

    return {
      data,
      total: Number(total[0].count),
      limit,
    };
  }
}
