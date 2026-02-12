import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "prisma/prisma.service";

import { HealthController } from "./health.controller";

describe("HealthController", () => {
  let controller: HealthController;

  const mockPrisma = {
    $queryRawUnsafe: jest.fn(),
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
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ "?column?": 1 }]);

      const result = await controller.check();

      expect(result.status).toBe("ok");
      expect(result.db).toBe("connected");
      expect(result.uptime).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it("should return error status when DB query fails", async () => {
      mockPrisma.$queryRawUnsafe.mockRejectedValue(
        new Error("Connection refused"),
      );

      const result = await controller.check();

      expect(result.status).toBe("error");
      expect(result.db).toBe("disconnected");
      expect(result.uptime).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it("should return valid ISO timestamp", async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ "?column?": 1 }]);

      const result = await controller.check();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
    });

    it("should return numeric uptime", async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ "?column?": 1 }]);

      const result = await controller.check();

      expect(typeof result.uptime).toBe("number");
      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
