import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "prisma/prisma.service";

import { RedisService } from "../redis/redis.service";
import { MapService } from "./map.service";

describe("MapService", () => {
  let service: MapService;

  const mockPrisma = {
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
        MapService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
      ],
    }).compile();

    service = module.get<MapService>(MapService);

    jest.clearAllMocks();
  });

  describe("getMap", () => {
    const defaultDto = {
      west: -180,
      south: -90,
      east: 180,
      north: 90,
      zoom: 5,
    };

    it("should return map data with total and limit", async () => {
      mockRedis.get.mockResolvedValue(null);
      const mockData = [
        {
          id: 1,
          magnitude: 5.5,
          depth: 10,
          latitude: 35.0,
          longitude: 139.0,
          location: "Japan",
          occurredAt: new Date(),
        },
      ];
      mockPrisma.$queryRaw
        .mockResolvedValueOnce(mockData)
        .mockResolvedValueOnce([{ count: BigInt(500) }]);

      const result = await service.getMap(defaultDto);

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(500);
      expect(result.limit).toBe(100_000);
    });

    it("should use zoom-based limit for low zoom", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      const result = await service.getMap({ ...defaultDto, zoom: 3 });

      expect(result.limit).toBe(70_000);
    });

    it("should return cached data when available", async () => {
      const cachedResult = {
        data: [{ id: 1, magnitude: 4.0 }],
        total: 100,
        limit: 100_000,
      };
      mockRedis.get.mockResolvedValue(cachedResult);

      const result = await service.getMap(defaultDto);

      expect(result).toEqual(cachedResult);
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it("should cache result after fetching from DB", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ id: 1 }])
        .mockResolvedValueOnce([{ count: BigInt(1) }]);

      await service.getMap(defaultDto);

      expect(mockRedis.set).toHaveBeenCalledWith(
        `map:${defaultDto.west}:${defaultDto.south}:${defaultDto.east}:${defaultDto.north}:${defaultDto.zoom}`,
        expect.objectContaining({
          data: [{ id: 1 }],
          total: 1,
          limit: 100_000,
        }),
        60,
      );
    });

    it("should build correct cache key from bounds and zoom", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      const dto = { west: -10, south: -20, east: 30, north: 40, zoom: 7 };
      await service.getMap(dto);

      expect(mockRedis.get).toHaveBeenCalledWith("map:-10:-20:30:40:7");
    });

    it("should handle large total count", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(1_000_000) }]);

      const result = await service.getMap(defaultDto);

      expect(result.total).toBe(1_000_000);
    });

    it("should pass SRID 4326 to spatial query", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      await service.getMap(defaultDto);

      const sqlArg = mockPrisma.$queryRaw.mock.calls[0][0];
      expect(sqlArg.values).toContain(4326);
    });

    it("should pass bounds as parameters", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      await service.getMap({
        west: 10,
        south: 20,
        east: 30,
        north: 40,
        zoom: 5,
      });

      const sqlArg = mockPrisma.$queryRaw.mock.calls[0][0];
      expect(sqlArg.values).toEqual(expect.arrayContaining([10, 20, 30, 40]));
    });

    it("should return max limit (200k) for zoom > 8", async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]);

      const result = await service.getMap({ ...defaultDto, zoom: 12 });

      expect(result.limit).toBe(200_000);
    });
  });
});
