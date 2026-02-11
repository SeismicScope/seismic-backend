import { Test, TestingModule } from "@nestjs/testing";

import { PrismaService } from "../../../prisma/prisma.service";
import { EarthquakesService } from "./earthquakes.service";

describe("EarthquakesService", () => {
  let service: EarthquakesService;
  let prisma: PrismaService;

  const mockPrisma = {
    earthquake: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EarthquakesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<EarthquakesService>(EarthquakesService);
    prisma = module.get<PrismaService>(PrismaService);

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
  });

  describe("getEarthquakeById", () => {
    it("should return earthquake by id", async () => {
      const mockEarthquake = { id: 1, magnitude: 5.5 };
      mockPrisma.earthquake.findUnique.mockResolvedValue(mockEarthquake);

      const result = await service.getEarthquakeById(1);

      expect(result).toEqual(mockEarthquake);
      expect(mockPrisma.earthquake.findUnique).toHaveBeenCalledWith({
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
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
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
  });
});
