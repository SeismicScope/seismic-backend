import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";

import { RedisService } from "./redis.service";

const mockRedisClient = {
  ping: jest.fn().mockResolvedValue("PONG"),
  quit: jest.fn().mockResolvedValue("OK"),
  get: jest.fn(),
  set: jest.fn(),
  keys: jest.fn(),
  del: jest.fn(),
};

jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe("RedisService", () => {
  let service: RedisService;

  const mockConfig = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        IO_REDIS_HOST: "localhost",
        IO_REDIS_PORT: "6379",
      };

      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  describe("onModuleInit", () => {
    it("should ping Redis on init", async () => {
      await service.onModuleInit();

      expect(mockRedisClient.ping).toHaveBeenCalled();
    });
  });

  describe("onModuleDestroy", () => {
    it("should quit Redis connection on destroy", async () => {
      await service.onModuleDestroy();

      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("should return parsed JSON when key exists", async () => {
      const data = { totalEvents: 100, maxMagnitude: 9.5 };
      mockRedisClient.get.mockResolvedValue(JSON.stringify(data));

      const result = await service.get<typeof data>("stats:test");

      expect(result).toEqual(data);
      expect(mockRedisClient.get).toHaveBeenCalledWith("stats:test");
    });

    it("should return null when key does not exist", async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle array data", async () => {
      const data = [
        { date: "2023-01-01", count: 100 },
        { date: "2023-02-01", count: 200 },
      ];
      mockRedisClient.get.mockResolvedValue(JSON.stringify(data));

      const result = await service.get<typeof data>("ts:test");

      expect(result).toEqual(data);
    });
  });

  describe("set", () => {
    it("should set value with TTL", async () => {
      const data = { total: 500 };
      mockRedisClient.set.mockResolvedValue("OK");

      await service.set("stats:key", data, 300);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "stats:key",
        JSON.stringify(data),
        "EX",
        300,
      );
    });

    it("should serialize array values", async () => {
      const data = [1, 2, 3];
      mockRedisClient.set.mockResolvedValue("OK");

      await service.set("list:key", data, 60);

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        "list:key",
        JSON.stringify(data),
        "EX",
        60,
      );
    });
  });

  describe("del", () => {
    it("should delete keys matching pattern", async () => {
      mockRedisClient.keys.mockResolvedValue(["ts:a", "ts:b", "ts:c"]);
      mockRedisClient.del.mockResolvedValue(3);

      await service.del("ts:*");

      expect(mockRedisClient.keys).toHaveBeenCalledWith("ts:*");
      expect(mockRedisClient.del).toHaveBeenCalledWith("ts:a", "ts:b", "ts:c");
    });

    it("should not call del when no keys match pattern", async () => {
      mockRedisClient.keys.mockResolvedValue([]);

      await service.del("nonexistent:*");

      expect(mockRedisClient.keys).toHaveBeenCalledWith("nonexistent:*");
      expect(mockRedisClient.del).not.toHaveBeenCalled();
    });
  });
});
