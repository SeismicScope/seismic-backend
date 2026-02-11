import { Test, TestingModule } from "@nestjs/testing";

import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";

describe("AnalyticsController", () => {
  let controller: AnalyticsController;

  const mockService = {
    timeSeries: jest.fn(),
    getEarthquakesStats: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: mockService }],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);

    jest.clearAllMocks();
  });

  describe("timeSeries", () => {
    it("should return time-series data", async () => {
      const data = [{ date: "2023-01-01", count: 100 }];
      mockService.timeSeries.mockResolvedValue(data);

      const result = await controller.timeSeries({ interval: "month" });

      expect(result).toEqual(data);
      expect(mockService.timeSeries).toHaveBeenCalledWith({
        interval: "month",
      });
    });

    it("should pass filters to service", async () => {
      mockService.timeSeries.mockResolvedValue([]);

      const filters = { interval: "day" as const, minMag: 2, maxMag: 8 };
      await controller.timeSeries(filters);

      expect(mockService.timeSeries).toHaveBeenCalledWith(filters);
    });
  });

  describe("getEarthquakesStats", () => {
    it("should return aggregate stats", async () => {
      const stats = {
        totalEvents: 1000,
        maxMagnitude: 9.5,
        avgMagnitude: 3.88,
        avgDepth: 53.73,
      };
      mockService.getEarthquakesStats.mockResolvedValue(stats);

      const result = await controller.getEarthquakesStats({ limit: 50 });

      expect(result).toEqual(stats);
    });

    it("should pass filters to service", async () => {
      mockService.getEarthquakesStats.mockResolvedValue({});

      const filters = { limit: 50, minDepth: 10, maxDepth: 100 };
      await controller.getEarthquakesStats(filters);

      expect(mockService.getEarthquakesStats).toHaveBeenCalledWith(filters);
    });
  });
});
