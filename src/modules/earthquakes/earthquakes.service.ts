import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME } from "@/constants";

import type { GetEarthquakesDto } from "./dto/get-earthquakes.dto";

@Injectable()
export class EarthquakesService {
  constructor(private readonly prisma: PrismaService) {}

  async getEarthquakes(filters: GetEarthquakesDto) {
    const { cursor, limit, minMag, maxMag, dateFrom, dateTo } = filters;
    const where: Prisma.EarthquakeWhereInput = {};

    if (minMag !== undefined || maxMag !== undefined) {
      where.magnitude = { gte: minMag, lte: maxMag };
    }

    if (dateFrom || dateTo) {
      where.occuredAt = { gte: dateFrom, lte: dateTo };
    }

    return this.prisma.earthquake.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { occuredAt: "desc" },
    });
  }

  async getEarthquakesStats() {
    const stats = await this.prisma.earthquake.aggregate({
      _count: { id: true },
      _max: { magnitude: true },
      _avg: {
        magnitude: true,
        depth: true,
      },
    });

    return {
      totalEvents: stats._count.id,
      maxMagnitude: stats._max.magnitude || 0,
      avgMagnitude: Number((stats._avg.magnitude || 0).toFixed(2)),
      avgDepth: Number((stats._avg.depth || 0).toFixed(2)),
    };
  }

  async getEarthquakesMagnitudeHistogram() {
    const stats = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT
        FLOOR(magnitude) as bin,
        COUNT(*) as count
      FROM "${DB_EARTHQUAKE_NAME}"
      WHERE magnitude IS NOT NULL
      GROUP BY bin
      ORDER BY bin ASC
    `);

    return stats.map((s) => ({
      magnitude: Number(s.bin),
      count: Number(s.count),
    }));
  }
}
