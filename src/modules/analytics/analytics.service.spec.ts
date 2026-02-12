import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "prisma/prisma.service";

import { RedisService } from "../redis/redis.service";
import { AnalyticsService } from "./analytics.service";
import type { TimeInterval } from "./dto/time-series.dto";

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  const mockPrisma = {
    earthquake: {
      aggregate: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);

    jest.clearAllMocks();
  });

  describe("getEarthquakesStats", () => {
    it("should return formatted stats", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.earthquake.aggregate.mockResolvedValue({
        _count: { id: 1000 },
        _max: { magnitude: 9.5 },
        _avg: { magnitude: 3.88123, depth: 53.7321 },
      });

      const result = await service.getEarthquakesStats({
        limit: 50,
      });

      expect(result).toEqual({
        totalEvents: 1000,
        maxMagnitude: 9.5,
        avgMagnitude: 3.88,
        avgDepth: 53.73,
      });
    });

    it("should handle null aggregates", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.earthquake.aggregate.mockResolvedValue({
        _count: { id: 0 },
        _max: { magnitude: null },
        _avg: { magnitude: null, depth: null },
      });

      const result = await service.getEarthquakesStats({
        limit: 50,
      });

      expect(result).toEqual({
        totalEvents: 0,
        maxMagnitude: 0,
        avgMagnitude: 0,
        avgDepth: 0,
      });
    });

    it("should return cached stats when available", async () => {
      const cachedStats = {
        totalEvents: 500,
        maxMagnitude: 8.0,
        avgMagnitude: 4.5,
        avgDepth: 30.0,
      };
      mockRedis.get.mockResolvedValue(cachedStats);

      const result = await service.getEarthquakesStats({ limit: 50 });

      expect(result).toEqual(cachedStats);
      expect(mockPrisma.earthquake.aggregate).not.toHaveBeenCalled();
    });

    it("should cache stats after fetching from DB", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.earthquake.aggregate.mockResolvedValue({
        _count: { id: 100 },
        _max: { magnitude: 7.0 },
        _avg: { magnitude: 4.0, depth: 20.0 },
      });

      await service.getEarthquakesStats({ limit: 50 });

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining("stats:"),
        {
          totalEvents: 100,
          maxMagnitude: 7.0,
          avgMagnitude: 4.0,
          avgDepth: 20.0,
        },
        300,
      );
    });

    it("should build correct cache key from filters", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.earthquake.aggregate.mockResolvedValue({
        _count: { id: 0 },
        _max: { magnitude: null },
        _avg: { magnitude: null, depth: null },
      });

      const filters = { limit: 50, minMag: 3, maxMag: 7 };
      await service.getEarthquakesStats(filters);

      expect(mockRedis.get).toHaveBeenCalledWith(
        `stats:${JSON.stringify(filters)}`,
      );
    });
  });

  describe("timeSeries", () => {
    it("should return formatted time-series data", async () => {
      mockRedis.get.mockResolvedValue(null);
      const mockDate = new Date("2023-01-01");
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { date: mockDate, count: BigInt(500) },
      ]);

      const result = await service.timeSeries({ interval: "month" });

      expect(result).toEqual([{ date: mockDate, count: 500 }]);
    });

    it("should throw for invalid interval", async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(
        service.timeSeries({ interval: "invalid" as unknown as TimeInterval }),
      ).rejects.toThrow("Invalid interval");
    });

    it("should pass trunc as parameterized value", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await service.timeSeries({ interval: "year" });

      const lastParam =
        mockPrisma.$queryRawUnsafe.mock.calls[0][
          mockPrisma.$queryRawUnsafe.mock.calls[0].length - 1
        ];
      expect(lastParam).toBe("year");
    });

    it("should return cached time-series when available", async () => {
      const cachedData = [
        { date: "2023-01-01", count: 100 },
        { date: "2023-02-01", count: 200 },
      ];
      mockRedis.get.mockResolvedValue(cachedData);

      const result = await service.timeSeries({ interval: "month" });

      expect(result).toEqual(cachedData);
      expect(mockPrisma.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should cache time-series after fetching from DB", async () => {
      mockRedis.get.mockResolvedValue(null);
      const mockDate = new Date("2023-01-01");
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { date: mockDate, count: BigInt(300) },
      ]);

      await service.timeSeries({ interval: "day" });

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining("ts:"),
        [{ date: mockDate, count: 300 }],
        300,
      );
    });

    it("should handle multiple time-series rows", async () => {
      mockRedis.get.mockResolvedValue(null);
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-02-01");
      const date3 = new Date("2023-03-01");

      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { date: date1, count: BigInt(100) },
        { date: date2, count: BigInt(200) },
        { date: date3, count: BigInt(50) },
      ]);

      const result = await service.timeSeries({ interval: "month" });

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ date: date1, count: 100 });
      expect(result[2]).toEqual({ date: date3, count: 50 });
    });

    it("should handle empty time-series result", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      const result = await service.timeSeries({ interval: "week" });

      expect(result).toEqual([]);
      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining("ts:"),
        [],
        300,
      );
    });
  });
});
