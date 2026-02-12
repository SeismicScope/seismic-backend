import { ServiceUnavailableException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "prisma/prisma.service";

import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<HealthController>(HealthController);

    jest.clearAllMocks();
  });

  describe("check", () => {
    it("should return ok status when DB is connected", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

      const result = await controller.check();

      expect(result.status).toBe("ok");
      expect(result.db).toBe("connected");
      expect(result.uptime).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it("should return error status when DB query fails", async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error("Connection refused"));

      try {
        await controller.check();
        fail("Expected ServiceUnavailableException");
      } catch (error) {
        const response = (
          error as ServiceUnavailableException
        ).getResponse() as Record<string, unknown>;
        expect(response.status).toBe("error");
        expect(response.db).toBe("disconnected");
        expect(response.uptime).toBeDefined();
        expect(response.timestamp).toBeDefined();
      }
    });

    it("should return valid ISO timestamp", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

      const result = await controller.check();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it("should return numeric uptime", async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

      const result = await controller.check();

      expect(typeof result.uptime).toBe("number");
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
