import { Controller, Get, Header } from "@nestjs/common";
import { ApiExcludeController } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";

import { MetricsService } from "./metrics.service";

@ApiExcludeController()
@SkipThrottle()
@Controller("metrics")
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header("Content-Type", "text/plain")
  async getMetrics(): Promise<string> {
    return this.metricsService.registry.metrics();
  }
}
