import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME, SORT_MAP } from "@/constants";
import {
  buildEarthquakeWhere,
  buildEarthquakeWhereSql,
} from "@/lib/build-earthquake-where";

import { RedisService } from "../redis/redis.service";
import type { EarthquakeResponseDto } from "./dto/earthquake-response.dto";
import type { GetEarthquakesDto } from "./dto/get-earthquakes.dto";

const EARTHQUAKE_SELECT = {
  id: true,
  occurredAt: true,
  magnitude: true,
  depth: true,
  latitude: true,
  longitude: true,
  location: true,
} as const;

const HISTOGRAM_TTL = 300; // 5 minutes

@Injectable()
export class EarthquakesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getEarthquakes(filters: GetEarthquakesDto) {
    const { cursor, limit = 50, sort } = filters;
    const where = buildEarthquakeWhere(filters);
    const orderBy: Prisma.EarthquakeOrderByWithRelationInput = sort
      ? SORT_MAP[sort]
      : { id: "asc" };

    const [data, total] = await Promise.all([
      this.prisma.earthquake.findMany({
        select: EARTHQUAKE_SELECT,
        where,
        take: limit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy,
      }),
      this.prisma.earthquake.count({ where }),
    ]);

    const nextCursor = data.length === limit ? data[data.length - 1].id : null;

    return {
      data,
      total,
      nextCursor,
    };
  }

  async getEarthquakeById(id: number): Promise<EarthquakeResponseDto | null> {
    return this.prisma.earthquake.findUnique({
      select: EARTHQUAKE_SELECT,
      where: { id },
    });
  }

  async getEarthquakesMagnitudeHistogram(filters: GetEarthquakesDto) {
    const cacheKey = `histogram:${JSON.stringify(filters)}`;
    const cached =
      await this.redis.get<{ magnitude: number; count: number }[]>(cacheKey);

    if (cached) return cached;

    const whereSql = buildEarthquakeWhereSql(filters);
    const tableName = Prisma.raw(`"${DB_EARTHQUAKE_NAME}"`);

    const stats = await this.prisma.$queryRaw<
      { bin: number; count: bigint }[]
    >(Prisma.sql`
      SELECT
        FLOOR(magnitude * 10) / 10 as bin,
        COUNT(*) as count
      FROM ${tableName}
      WHERE magnitude IS NOT NULL
      ${whereSql}
      GROUP BY bin
      ORDER BY bin ASC
    `);

    const result = stats.map((s) => ({
      magnitude: Number(Number(s.bin).toFixed(1)),
      count: Number(s.count),
    }));

    await this.redis.set(cacheKey, result, HISTOGRAM_TTL);

    return result;
  }
}
