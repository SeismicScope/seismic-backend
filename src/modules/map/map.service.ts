import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME, SRID } from "../../constants";
import { GetMapDto } from "./dto/get-map.dto";

const MAP_POINTS_LIMIT = 100000;

@Injectable()
export class MapService {
  constructor(private readonly prisma: PrismaService) {}

  async getMap(dto: GetMapDto) {
    const { west, south, east, north } = dto;

    return this.prisma.$queryRawUnsafe(
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
      MAP_POINTS_LIMIT,
    );
  }
}
