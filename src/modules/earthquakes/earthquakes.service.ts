import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

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
}
