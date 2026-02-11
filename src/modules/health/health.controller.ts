import { Controller, Get } from "@nestjs/common";

import { PrismaService } from "../../../prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");

      return {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: "connected",
      };
    } catch {
      return {
        status: "error",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: "disconnected",
      };
    }
  }
}
