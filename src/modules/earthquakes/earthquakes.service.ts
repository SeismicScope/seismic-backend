import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME, SORT_MAP } from "@/constants";
import {
  buildEarthquakeWhere,
  buildEarthquakeWhereSql,
} from "@/lib/build-earthquake-where";

import type { GetEarthquakesDto } from "./dto/get-earthquakes.dto";

@Injectable()
export class EarthquakesService {
  constructor(private readonly prisma: PrismaService) {}

  async getEarthquakes(filters: GetEarthquakesDto) {
    const { cursor, limit = 50, sort } = filters;
    const where = buildEarthquakeWhere(filters);
    const orderBy: Prisma.EarthquakeOrderByWithRelationInput = sort
      ? SORT_MAP[sort]
      : { id: "asc" };

    const [data, total] = await Promise.all([
      this.prisma.earthquake.findMany({
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

  async getEarthquakeById(id: number) {
    return this.prisma.earthquake.findUnique({ where: { id } });
  }

  async getEarthquakesMagnitudeHistogram(filters: GetEarthquakesDto) {
    const { sql, params } = buildEarthquakeWhereSql(filters);

    const stats = await this.prisma.$queryRawUnsafe<
      { bin: number; count: bigint }[]
    >(
      `
      SELECT
        FLOOR(magnitude * 10) / 10 as bin,
        COUNT(*) as count
      FROM "${DB_EARTHQUAKE_NAME}"
      WHERE magnitude IS NOT NULL
      ${sql}
      GROUP BY bin
      ORDER BY bin ASC
    `,
      ...params,
    );

    return stats.map((s) => ({
      magnitude: Number(Number(s.bin).toFixed(1)),
      count: Number(s.count),
    }));
  }
}
