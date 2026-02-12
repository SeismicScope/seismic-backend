import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, route } = request;
    const path = route?.path ?? request.url;
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = String(response.statusCode);
        const durationSec =
          Number(process.hrtime.bigint() - start) / 1_000_000_000;

        this.metrics.httpRequestDuration
          .labels(method, path, statusCode)
          .observe(durationSec);

        this.metrics.httpRequestTotal.labels(method, path, statusCode).inc();
      }),
    );
  }
}
