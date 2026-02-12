import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME } from "@/constants";
import {
  buildEarthquakeWhere,
  buildEarthquakeWhereSql,
} from "@/lib/build-earthquake-where";
import type { GetEarthquakesDto } from "@/modules/earthquakes/dto/get-earthquakes.dto";

import { RedisService } from "../redis/redis.service";
import { PG_INTERVALS } from "./constants";
import type { TimeSeriesDto } from "./dto/time-series.dto";

const TIME_SERIES_TTL = 300; // 5 minutes
const STATS_TTL = 300; // 5 minutes

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async timeSeries(filters: TimeSeriesDto) {
    const cacheKey = `ts:${JSON.stringify(filters)}`;
    const cached =
      await this.redis.get<{ date: string; count: number }[]>(cacheKey);

    if (cached) return cached;

    const whereSql = buildEarthquakeWhereSql(filters);
    const trunc = PG_INTERVALS[filters.interval];

    if (!trunc) {
      throw new Error(`Invalid interval: ${filters.interval}`);
    }

    const tableName = Prisma.raw(`"${DB_EARTHQUAKE_NAME}"`);

    const rows = await this.prisma.$queryRaw<
      { date: Date; count: bigint }[]
    >(Prisma.sql`
      SELECT
        DATE_TRUNC(${trunc}, "occurredAt") as date,
        COUNT(*) as count
      FROM ${tableName}
      WHERE 1=1
      ${whereSql}
      GROUP BY date
      ORDER BY date ASC
    `);

    const result = rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));

    await this.redis.set(cacheKey, result, TIME_SERIES_TTL);

    return result;
  }

  async getEarthquakesStats(filters: GetEarthquakesDto) {
    const cacheKey = `stats:${JSON.stringify(filters)}`;
    const cached = await this.redis.get<{
      totalEvents: number;
      maxMagnitude: number;
      avgMagnitude: number;
      avgDepth: number;
    }>(cacheKey);

    if (cached) return cached;

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

    const result = {
      totalEvents: stats._count.id,
      maxMagnitude: stats._max.magnitude || 0,
      avgMagnitude: Number((stats._avg.magnitude || 0).toFixed(2)),
      avgDepth: Number((stats._avg.depth || 0).toFixed(2)),
    };

    await this.redis.set(cacheKey, result, STATS_TTL);

    return result;
  }
}
