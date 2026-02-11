import { Test, TestingModule } from "@nestjs/testing";

import { ImportController } from "./import.controller";
import { ImportService } from "./import.service";

describe("ImportController", () => {
  let controller: ImportController;

  const mockService = {
    createImport: jest.fn(),
    getImportStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImportController],
      providers: [{ provide: ImportService, useValue: mockService }],
    }).compile();

    controller = module.get<ImportController>(ImportController);

    jest.clearAllMocks();
  });

  describe("upload", () => {
    it("should create import from uploaded file", async () => {
      const dbJob = {
        id: 1,
        fileName: "data.csv",
        status: "queued",
        processed: 0,
      };
      mockService.createImport.mockResolvedValue(dbJob);

      const mockFile = {
        path: "/uploads/data.csv",
        originalname: "data.csv",
      } as Express.Multer.File;

      const result = await controller.upload(mockFile);

      expect(result).toEqual(dbJob);
      expect(mockService.createImport).toHaveBeenCalledWith(
        "/uploads/data.csv",
        "data.csv",
      );
    });
  });

  describe("getStatus", () => {
    it("should return import status by id", async () => {
      const job = { id: 1, status: "completed", processed: 50000 };
      mockService.getImportStatus.mockResolvedValue(job);

      const result = await controller.getStatus(1);

      expect(result).toEqual(job);
      expect(mockService.getImportStatus).toHaveBeenCalledWith(1);
    });

    it("should return null for non-existent job", async () => {
      mockService.getImportStatus.mockResolvedValue(null);

      const result = await controller.getStatus(999);

      expect(result).toBeNull();
    });
  });
});
