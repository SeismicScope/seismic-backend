import { Prisma } from "@prisma/client";

import type { EarthquakeFilterParams } from "@/types";

export function buildEarthquakeWhere(
  filters: EarthquakeFilterParams,
): Prisma.EarthquakeWhereInput {
  const where: Prisma.EarthquakeWhereInput = {};

  if (filters.minMag !== undefined || filters.maxMag !== undefined) {
    where.magnitude = { gte: filters.minMag, lte: filters.maxMag };
  }

  if (filters.minDepth !== undefined || filters.maxDepth !== undefined) {
    where.depth = { gte: filters.minDepth, lte: filters.maxDepth };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.occurredAt = { gte: filters.dateFrom, lte: filters.dateTo };
  }

  return where;
}

export function buildEarthquakeWhereSql(
  filters: EarthquakeFilterParams,
): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (filters.minMag !== undefined) {
    conditions.push(Prisma.sql`magnitude >= ${filters.minMag}`);
  }
  if (filters.maxMag !== undefined) {
    conditions.push(Prisma.sql`magnitude <= ${filters.maxMag}`);
  }
  if (filters.minDepth !== undefined) {
    conditions.push(Prisma.sql`depth >= ${filters.minDepth}`);
  }
  if (filters.maxDepth !== undefined) {
    conditions.push(Prisma.sql`depth <= ${filters.maxDepth}`);
  }
  if (filters.dateFrom) {
    conditions.push(Prisma.sql`"occurredAt" >= ${filters.dateFrom}`);
  }
  if (filters.dateTo) {
    conditions.push(Prisma.sql`"occurredAt" <= ${filters.dateTo}`);
  }

  if (conditions.length === 0) return Prisma.empty;

  return Prisma.sql`AND ${Prisma.join(conditions, " AND ")}`;
}
