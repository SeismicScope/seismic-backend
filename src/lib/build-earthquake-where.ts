import type { Prisma } from "@prisma/client";

import type { GetEarthquakesDto } from "@/modules/earthquakes/dto/get-earthquakes.dto";

export function buildEarthquakeWhere(
  filters: GetEarthquakesDto,
): Prisma.EarthquakeWhereInput {
  const where: Prisma.EarthquakeWhereInput = {};

  if (filters.minMag !== undefined || filters.maxMag !== undefined) {
    where.magnitude = { gte: filters.minMag, lte: filters.maxMag };
  }

  if (filters.minDepth !== undefined || filters.maxDepth !== undefined) {
    where.depth = { gte: filters.minDepth, lte: filters.maxDepth };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.occuredAt = { gte: filters.dateFrom, lte: filters.dateTo };
  }

  return where;
}

export function buildEarthquakeWhereSql(filters: GetEarthquakesDto) {
  const conditions: string[] = [];
  const params: (number | Date)[] = [];
  let idx = 1;

  if (filters.minMag !== undefined) {
    conditions.push(`magnitude >= $${idx++}`);
    params.push(filters.minMag);
  }
  if (filters.maxMag !== undefined) {
    conditions.push(`magnitude <= $${idx++}`);
    params.push(filters.maxMag);
  }
  if (filters.minDepth !== undefined) {
    conditions.push(`depth >= $${idx++}`);
    params.push(filters.minDepth);
  }
  if (filters.maxDepth !== undefined) {
    conditions.push(`depth <= $${idx++}`);
    params.push(filters.maxDepth);
  }
  if (filters.dateFrom) {
    conditions.push(`"occuredAt" >= $${idx++}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`"occuredAt" <= $${idx++}`);
    params.push(filters.dateTo);
  }

  const sql = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

  return { sql, params };
}
