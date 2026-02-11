import { Test, TestingModule } from "@nestjs/testing";

import { MapController } from "./map.controller";
import { MapService } from "./map.service";

describe("MapController", () => {
  let controller: MapController;

  const mockService = {
    getMap: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MapController],
      providers: [{ provide: MapService, useValue: mockService }],
    }).compile();

    controller = module.get<MapController>(MapController);

    jest.clearAllMocks();
  });

  describe("getMapData", () => {
    it("should return map data", async () => {
      const mapData = { data: [{ id: 1 }], total: 1, limit: 100_000 };
      mockService.getMap.mockResolvedValue(mapData);

      const dto = { west: -180, south: -90, east: 180, north: 90, zoom: 5 };
      const result = await controller.getMapData(dto);

      expect(result).toEqual(mapData);
      expect(mockService.getMap).toHaveBeenCalledWith(dto);
    });

    it("should pass zoom to service", async () => {
      mockService.getMap.mockResolvedValue({
        data: [],
        total: 0,
        limit: 50_000,
      });

      const dto = { west: 0, south: 0, east: 10, north: 10, zoom: 3 };
      await controller.getMapData(dto);

      expect(mockService.getMap).toHaveBeenCalledWith(
        expect.objectContaining({ zoom: 3 }),
      );
    });
  });
});
