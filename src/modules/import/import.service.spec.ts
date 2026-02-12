import { getQueueToken } from "@nestjs/bullmq";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "prisma/prisma.service";

import { ImportService } from "./import.service";

describe("ImportService", () => {
  let service: ImportService;

  const mockPrisma = {
    importJob: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken("import-earthquakes"), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ImportService>(ImportService);

    jest.clearAllMocks();
  });

  describe("createImport", () => {
    it("should create an import job and add to queue", async () => {
      const dbJob = {
        id: 1,
        fileName: "data.csv",
        status: "queued",
        processed: 0,
      };
      mockPrisma.importJob.create.mockResolvedValue(dbJob);
      mockQueue.add.mockResolvedValue({ id: "queue-1" });

      const result = await service.createImport(
        "/uploads/data.csv",
        "data.csv",
      );

      expect(result).toEqual(dbJob);
      expect(mockPrisma.importJob.create).toHaveBeenCalledWith({
        data: {
          fileName: "data.csv",
          status: "queued",
          processed: 0,
        },
      });
    });

    it("should add job to queue with correct payload", async () => {
      const dbJob = {
        id: 42,
        fileName: "quakes.csv",
        status: "queued",
        processed: 0,
      };
      mockPrisma.importJob.create.mockResolvedValue(dbJob);
      mockQueue.add.mockResolvedValue({ id: "queue-42" });

      await service.createImport("/uploads/quakes.csv", "quakes.csv");

      expect(mockQueue.add).toHaveBeenCalledWith("import", {
        jobId: 42,
        filePath: "/uploads/quakes.csv",
      });
    });

    it("should return the created DB job", async () => {
      const dbJob = {
        id: 5,
        fileName: "test.csv",
        status: "queued",
        processed: 0,
      };
      mockPrisma.importJob.create.mockResolvedValue(dbJob);
      mockQueue.add.mockResolvedValue({});

      const result = await service.createImport(
        "/uploads/test.csv",
        "test.csv",
      );

      expect(result.id).toBe(5);
      expect(result.status).toBe("queued");
    });
  });

  describe("updateStatus", () => {
    it("should update job status", async () => {
      const updatedJob = { id: 1, status: "completed", processed: 5000 };
      mockPrisma.importJob.update.mockResolvedValue(updatedJob);

      const result = await service.updateStatus(1, {
        status: "completed",
        processed: 5000,
      });

      expect(result).toEqual(updatedJob);
      expect(mockPrisma.importJob.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: "completed", processed: 5000 },
      });
    });

    it("should update only processed count", async () => {
      const updatedJob = { id: 1, status: "processing", processed: 10000 };
      mockPrisma.importJob.update.mockResolvedValue(updatedJob);

      await service.updateStatus(1, { processed: 10000 });

      expect(mockPrisma.importJob.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { processed: 10000 },
      });
    });

    it("should update only status", async () => {
      const updatedJob = { id: 3, status: "failed" };
      mockPrisma.importJob.update.mockResolvedValue(updatedJob);

      await service.updateStatus(3, { status: "failed" });

      expect(mockPrisma.importJob.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { status: "failed" },
      });
    });
  });

  describe("getImportStatus", () => {
    it("should return import job by id", async () => {
      const job = {
        id: 1,
        fileName: "data.csv",
        status: "completed",
        processed: 50000,
      };
      mockPrisma.importJob.findUnique.mockResolvedValue(job);

      const result = await service.getImportStatus(1);

      expect(result).toEqual(job);
      expect(mockPrisma.importJob.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null for non-existent job", async () => {
      mockPrisma.importJob.findUnique.mockResolvedValue(null);

      const result = await service.getImportStatus(999);

      expect(result).toBeNull();
    });
  });
});
