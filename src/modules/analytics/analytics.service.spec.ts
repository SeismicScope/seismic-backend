import { Test, TestingModule } from "@nestjs/testing";

import { PrismaService } from "../../../prisma/prisma.service";
import { AnalyticsService } from "./analytics.service";

describe("AnalyticsService", () => {
  let service: AnalyticsService;

  const mockPrisma = {
    earthquake: {
      aggregate: jest.fn(),
    },
    $queryRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);

    jest.clearAllMocks();
  });

  describe("getEarthquakesStats", () => {
    it("should return formatted stats", async () => {
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
  });

  describe("timeSeries", () => {
    it("should return formatted time-series data", async () => {
      const mockDate = new Date("2023-01-01");
      mockPrisma.$queryRawUnsafe.mockResolvedValue([
        { date: mockDate, count: BigInt(500) },
      ]);

      const result = await service.timeSeries({ interval: "month" });

      expect(result).toEqual([{ date: mockDate, count: 500 }]);
    });

    it("should throw for invalid interval", async () => {
      await expect(
        service.timeSeries({ interval: "invalid" as any }),
      ).rejects.toThrow("Invalid interval");
    });

    it("should pass trunc as parameterized value", async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

      await service.timeSeries({ interval: "year" });

      const lastParam =
        mockPrisma.$queryRawUnsafe.mock.calls[0][
          mockPrisma.$queryRawUnsafe.mock.calls[0].length - 1
        ];
      expect(lastParam).toBe("year");
    });
  });
});
