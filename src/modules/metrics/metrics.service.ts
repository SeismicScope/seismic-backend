import { Injectable, OnModuleInit } from "@nestjs/common";
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  readonly httpRequestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "Duration of HTTP requests in seconds",
    labelNames: ["method", "route", "status_code"] as const,
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
    registers: [this.registry],
  });

  readonly httpRequestTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"] as const,
    registers: [this.registry],
  });

  readonly importDuration = new Histogram({
    name: "import_duration_seconds",
    help: "Duration of CSV import jobs in seconds",
    labelNames: ["status"] as const,
    buckets: [1, 5, 10, 30, 60, 120, 300, 600],
    registers: [this.registry],
  });

  readonly importRowsProcessed = new Counter({
    name: "import_rows_processed_total",
    help: "Total number of rows processed during imports",
    registers: [this.registry],
  });

  readonly importBatchSize = new Histogram({
    name: "import_batch_size",
    help: "Size of import batches",
    buckets: [100, 500, 1000, 2500, 5000],
    registers: [this.registry],
  });

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }
}
