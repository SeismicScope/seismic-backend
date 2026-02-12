import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "prisma/prisma.service";

import { RedisService } from "../redis/redis.service";
import type { GetEarthquakesDto } from "./dto/get-earthquakes.dto";
import { EarthquakesService } from "./earthquakes.service";

describe("EarthquakesService", () => {
  let service: EarthquakesService;

  const mockPrisma = {
    earthquake: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  const mockRedis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EarthquakesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<EarthquakesService>(EarthquakesService);

    jest.clearAllMocks();
  });

  describe("getEarthquakes", () => {
    it("should return paginated data with total and nextCursor", async () => {
      const mockData = [
        { id: 1, magnitude: 5.0 },
        { id: 2, magnitude: 6.0 },
      ];

      mockPrisma.earthquake.findMany.mockResolvedValue(mockData);
      mockPrisma.earthquake.count.mockResolvedValue(100);

      const result = await service.getEarthquakes({ limit: 50 });

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(100);
      expect(result.nextCursor).toBeNull();
    });

    it("should set nextCursor when data length equals limit", async () => {
      const mockData = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        magnitude: 5.0,
      }));

      mockPrisma.earthquake.findMany.mockResolvedValue(mockData);
      mockPrisma.earthquake.count.mockResolvedValue(100);

      const result = await service.getEarthquakes({ limit: 10 });

      expect(result.nextCursor).toBe(10);
    });

    it("should skip 1 when cursor is provided", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      await service.getEarthquakes({ limit: 50, cursor: 5 });

      expect(mockPrisma.earthquake.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          cursor: { id: 5 },
        }),
      );
    });

    it("should not skip when no cursor", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      await service.getEarthquakes({ limit: 50 });

      expect(mockPrisma.earthquake.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          cursor: undefined,
        }),
      );
    });

    it("should use default sort when no sort provided", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      await service.getEarthquakes({ limit: 50 });

      expect(mockPrisma.earthquake.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { id: "asc" },
        }),
      );
    });

    it("should apply sort when provided", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      await service.getEarthquakes({ limit: 50, sort: "magnitude_desc" });

      expect(mockPrisma.earthquake.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { magnitude: "desc" },
        }),
      );
    });

    it("should apply date_asc sort", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      await service.getEarthquakes({ limit: 50, sort: "date_asc" });

      expect(mockPrisma.earthquake.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { occurredAt: "asc" },
        }),
      );
    });

    it("should apply depth_desc sort", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      await service.getEarthquakes({ limit: 50, sort: "depth_desc" });

      expect(mockPrisma.earthquake.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { depth: "desc" },
        }),
      );
    });

    it("should use default limit of 50 when not specified", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      await service.getEarthquakes({} as unknown as GetEarthquakesDto);

      expect(mockPrisma.earthquake.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });

    it("should return empty data array when no results", async () => {
      mockPrisma.earthquake.findMany.mockResolvedValue([]);
      mockPrisma.earthquake.count.mockResolvedValue(0);

      const result = await service.getEarthquakes({ limit: 50 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe("getEarthquakeById", () => {
    it("should return earthquake by id", async () => {
      const mockEarthquake = { id: 1, magnitude: 5.5 };
      mockPrisma.earthquake.findUnique.mockResolvedValue(mockEarthquake);

      const result = await service.getEarthquakeById(1);

      expect(result).toEqual(mockEarthquake);
      expect(mockPrisma.earthquake.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          occurredAt: true,
          magnitude: true,
          depth: true,
          latitude: true,
          longitude: true,
          location: true,
        },
        where: { id: 1 },
      });
    });

    it("should return null for non-existent id", async () => {
      mockPrisma.earthquake.findUnique.mockResolvedValue(null);

      const result = await service.getEarthquakeById(999);

      expect(result).toBeNull();
    });
  });

  describe("getEarthquakesMagnitudeHistogram", () => {
    it("should return formatted histogram data", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([
        { bin: 2.0, count: BigInt(150) },
        { bin: 3.5, count: BigInt(300) },
        { bin: 5.0, count: BigInt(50) },
      ]);

      const result = await service.getEarthquakesMagnitudeHistogram({
        limit: 50,
      });

      expect(result).toEqual([
        { magnitude: 2.0, count: 150 },
        { magnitude: 3.5, count: 300 },
        { magnitude: 5.0, count: 50 },
      ]);
    });

    it("should return cached histogram when available", async () => {
      const cachedHistogram = [
        { magnitude: 2.0, count: 150 },
        { magnitude: 3.5, count: 300 },
      ];
      mockRedis.get.mockResolvedValue(cachedHistogram);

      const result = await service.getEarthquakesMagnitudeHistogram({
        limit: 50,
      });

      expect(result).toEqual(cachedHistogram);
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it("should cache histogram after fetching from DB", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([
        { bin: 4.0, count: BigInt(100) },
      ]);

      await service.getEarthquakesMagnitudeHistogram({ limit: 50 });

      expect(mockRedis.set).toHaveBeenCalledWith(
        expect.stringContaining("histogram:"),
        [{ magnitude: 4.0, count: 100 }],
        300,
      );
    });

    it("should handle empty histogram result", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await service.getEarthquakesMagnitudeHistogram({
        limit: 50,
      });

      expect(result).toEqual([]);
    });

    it("should build correct cache key from filters", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const filters = { limit: 50, minDepth: 10, maxDepth: 100 };
      await service.getEarthquakesMagnitudeHistogram(filters);

      expect(mockRedis.get).toHaveBeenCalledWith(
        `histogram:${JSON.stringify(filters)}`,
      );
    });
  });
});
