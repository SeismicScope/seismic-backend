import { Controller, Get, ServiceUnavailableException } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "prisma/prisma.service";

import { HealthResponseDto } from "./dto/health-response.dto";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "Check API and database health status" })
  @ApiOkResponse({ type: HealthResponseDto })
  async check() {
    try {
      await this.prisma.$queryRawUnsafe("SELECT 1");

      return {
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: "connected",
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: "error",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: "disconnected",
      });
    }
  }
}
