import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { SentryModule } from "@sentry/nestjs/setup";
import { WinstonModule } from "nest-winston";
import { PrismaModule } from "prisma/prisma.module";

import { envValidationSchema } from "./lib/env.validation";
import { winstonConfig } from "./lib/winston.config";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuthModule } from "./modules/auth/auth.module";
import { EarthquakesModule } from "./modules/earthquakes/earthquakes.module";
import { HealthModule } from "./modules/health/health.module";
import { ImportModule } from "./modules/import/import.module";
import { MapModule } from "./modules/map/map.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { RedisModule } from "./modules/redis/redis.module";
import { ShortenerModule } from "./modules/shortener/shortener.module";

@Module({
  imports: [
    SentryModule.forRoot(),
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([
      { name: "default", ttl: 60_000, limit: 500 },
      { name: "strict", ttl: 60_000, limit: 50 },
    ]),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get<string>("IO_REDIS_HOST") ?? "localhost";
        const portString = config.get<string>("IO_REDIS_PORT") ?? "6379";
        const port = parseInt(portString, 10);

        return {
          connection: {
            host,
            port,
          },
        };
      },
    }),
    PrismaModule,
    RedisModule,
    HealthModule,
    ImportModule,
    EarthquakesModule,
    MapModule,
    AnalyticsModule,
    AuthModule,
    MetricsModule,
    ShortenerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
