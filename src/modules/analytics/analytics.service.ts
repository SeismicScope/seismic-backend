import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME } from "@/constants";
import {
  buildEarthquakeWhere,
  buildEarthquakeWhereSql,
} from "@/lib/build-earthquake-where";
import type { GetEarthquakesDto } from "@/modules/earthquakes/dto/get-earthquakes.dto";

import { PG_INTERVALS } from "./constants";
import type { TimeSeriesDto } from "./dto/time-series.dto";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async timeSeries(filters: TimeSeriesDto) {
    const { sql, params } = buildEarthquakeWhereSql(filters);
    const trunc = PG_INTERVALS[filters.interval];

    if (!trunc) {
      throw new Error(`Invalid interval: ${filters.interval}`);
    }

    const idx = params.length + 1;

    const rows = await this.prisma.$queryRawUnsafe<
      { date: Date; count: bigint }[]
    >(
      `
      SELECT
        DATE_TRUNC($${idx}, "occuredAt") as date,
        COUNT(*) as count
      FROM "${DB_EARTHQUAKE_NAME}"
      WHERE 1=1
      ${sql}
      GROUP BY date
      ORDER BY date ASC
    `,
      ...params,
      trunc,
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
