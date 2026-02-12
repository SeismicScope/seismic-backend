import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis({
      host: this.config.get<string>("IO_REDIS_HOST") ?? "localhost",
      port: parseInt(this.config.get<string>("IO_REDIS_PORT") ?? "6379", 10),
    });
  }

  async onModuleInit() {
    await this.client.ping();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);

    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  async del(pattern: string): Promise<void> {
    const stream = this.client.scanStream({
      match: pattern,
      count: 100,
    });

    const pipeline = this.client.pipeline();

    for await (const keys of stream) {
      if (keys.length) {
        pipeline.unlink(...keys);
      }
    }

    await pipeline.exec();
  }
}
