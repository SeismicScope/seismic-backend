import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ConfigService } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ImportModule } from "./modules/import/import.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    ImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
