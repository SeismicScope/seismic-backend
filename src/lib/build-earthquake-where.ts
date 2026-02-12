import type { Prisma } from "@prisma/client";

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

export function buildEarthquakeWhereSql(filters: EarthquakeFilterParams) {
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
    conditions.push(`"occurredAt" >= $${idx++}`);
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    conditions.push(`"occurredAt" <= $${idx++}`);
    params.push(filters.dateTo);
  }

  const sql = conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : "";

  return { sql, params };
}
