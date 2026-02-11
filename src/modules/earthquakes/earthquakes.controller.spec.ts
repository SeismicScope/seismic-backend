import { Test, TestingModule } from "@nestjs/testing";

import { EarthquakesController } from "./earthquakes.controller";
import { EarthquakesService } from "./earthquakes.service";

describe("EarthquakesController", () => {
  let controller: EarthquakesController;

  const mockService = {
    getEarthquakes: jest.fn(),
    getEarthquakeById: jest.fn(),
    getEarthquakesMagnitudeHistogram: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EarthquakesController],
      providers: [{ provide: EarthquakesService, useValue: mockService }],
    }).compile();

    controller = module.get<EarthquakesController>(EarthquakesController);

    jest.clearAllMocks();
  });

  describe("getEarthquakes", () => {
    it("should return paginated earthquakes", async () => {
      const expected = { data: [], total: 0, nextCursor: null };
      mockService.getEarthquakes.mockResolvedValue(expected);

      const result = await controller.getEarthquakes({ limit: 50 });

      expect(result).toEqual(expected);
      expect(mockService.getEarthquakes).toHaveBeenCalledWith({ limit: 50 });
    });

    it("should pass filters to service", async () => {
      mockService.getEarthquakes.mockResolvedValue({
        data: [],
        total: 0,
        nextCursor: null,
      });

      const filters = {
        limit: 10,
        minMag: 3,
        maxMag: 7,
        sort: "date_desc" as const,
      };
      await controller.getEarthquakes(filters);

      expect(mockService.getEarthquakes).toHaveBeenCalledWith(filters);
    });
  });

  describe("getEarthquakesMagnitudeHistogram", () => {
    it("should return histogram data", async () => {
      const histogram = [{ magnitude: 5.0, count: 100 }];
      mockService.getEarthquakesMagnitudeHistogram.mockResolvedValue(histogram);

      const result = await controller.getEarthquakesMagnitudeHistogram({
        limit: 50,
      });

      expect(result).toEqual(histogram);
    });
  });

  describe("getEarthquakeById", () => {
    it("should return a single earthquake", async () => {
      const earthquake = { id: 1, magnitude: 6.5 };
      mockService.getEarthquakeById.mockResolvedValue(earthquake);

      const result = await controller.getEarthquakeById(1);

      expect(result).toEqual(earthquake);
      expect(mockService.getEarthquakeById).toHaveBeenCalledWith(1);
    });

    it("should return null for non-existent earthquake", async () => {
      mockService.getEarthquakeById.mockResolvedValue(null);

      const result = await controller.getEarthquakeById(999);

      expect(result).toBeNull();
    });
  });
});
