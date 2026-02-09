import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME } from "@/constants";
import {
  buildEarthquakeWhere,
  buildEarthquakeWhereSql,
} from "@/lib/build-earthquake-where";
import type { GetEarthquakesDto } from "@/modules/earthquakes/dto/get-earthquakes.dto";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async timeSeries(filters: GetEarthquakesDto) {
    const { sql, params } = buildEarthquakeWhereSql(filters);

    const rows = await this.prisma.$queryRawUnsafe<
      { date: Date; count: bigint }[]
    >(
      `
      SELECT
        DATE_TRUNC('day', "occuredAt") as date,
        COUNT(*) as count
      FROM "${DB_EARTHQUAKE_NAME}"
      WHERE 1=1
      ${sql}
      GROUP BY date
      ORDER BY date ASC
    `,
      ...params,
    );

    return rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  async getEarthquakesStats(filters: GetEarthquakesDto) {
    const where = buildEarthquakeWhere(filters);

    const stats = await this.prisma.earthquake.aggregate({
      where,
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
}
