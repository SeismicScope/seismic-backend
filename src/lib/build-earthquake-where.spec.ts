import { Prisma } from "@prisma/client";

import {
  buildEarthquakeWhere,
  buildEarthquakeWhereSql,
} from "./build-earthquake-where";

describe("buildEarthquakeWhere", () => {
  it("should return empty where when no filters", () => {
    expect(buildEarthquakeWhere({})).toEqual({});
  });

  it("should filter by minMag", () => {
    const result = buildEarthquakeWhere({ minMag: 3 });
    expect(result.magnitude).toEqual({ gte: 3, lte: undefined });
  });

  it("should filter by maxMag", () => {
    const result = buildEarthquakeWhere({ maxMag: 7 });
    expect(result.magnitude).toEqual({ gte: undefined, lte: 7 });
  });

  it("should filter by magnitude range", () => {
    const result = buildEarthquakeWhere({ minMag: 3, maxMag: 7 });
    expect(result.magnitude).toEqual({ gte: 3, lte: 7 });
  });

  it("should filter by depth range", () => {
    const result = buildEarthquakeWhere({ minDepth: 10, maxDepth: 100 });
    expect(result.depth).toEqual({ gte: 10, lte: 100 });
  });

  it("should filter by date range", () => {
    const dateFrom = new Date("2023-01-01");
    const dateTo = new Date("2023-12-31");
    const result = buildEarthquakeWhere({ dateFrom, dateTo });
    expect(result.occurredAt).toEqual({ gte: dateFrom, lte: dateTo });
  });

  it("should combine all filters", () => {
    const dateFrom = new Date("2023-01-01");
    const result = buildEarthquakeWhere({
      minMag: 3,
      maxMag: 7,
      minDepth: 0,
      maxDepth: 50,
      dateFrom,
    });

    expect(result.magnitude).toEqual({ gte: 3, lte: 7 });
    expect(result.depth).toEqual({ gte: 0, lte: 50 });
    expect(result.occurredAt).toEqual({ gte: dateFrom, lte: undefined });
  });
});

describe("buildEarthquakeWhereSql", () => {
  it("should return Prisma.empty when no filters", () => {
    const result = buildEarthquakeWhereSql({});
    expect(result).toBe(Prisma.empty);
  });

  it("should build SQL for minMag", () => {
    const result = buildEarthquakeWhereSql({ minMag: 3 });
    expect(result.values).toEqual([3]);
  });

  it("should build SQL for multiple filters", () => {
    const result = buildEarthquakeWhereSql({ minMag: 3, maxMag: 7 });
    expect(result.values).toEqual([3, 7]);
  });

  it("should build SQL for all filters", () => {
    const dateFrom = new Date("2023-01-01");
    const dateTo = new Date("2023-12-31");
    const result = buildEarthquakeWhereSql({
      minMag: 2,
      maxMag: 8,
      minDepth: 0,
      maxDepth: 100,
      dateFrom,
      dateTo,
    });

    expect(result.values).toHaveLength(6);
    expect(result.values).toEqual([2, 8, 0, 100, dateFrom, dateTo]);
  });

  it("should parameterize depth filters", () => {
    const result = buildEarthquakeWhereSql({
      minDepth: 10,
      maxDepth: 50,
    });

    expect(result.values).toEqual([10, 50]);
  });
});
