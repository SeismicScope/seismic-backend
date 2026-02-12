import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "prisma/prisma.service";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Check API and database health status" })
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
