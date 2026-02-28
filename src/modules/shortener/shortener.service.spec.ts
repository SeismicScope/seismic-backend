import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "prisma/prisma.service";

import { RedisService } from "../redis/redis.service";
import { ShortenerService } from "./shortener.service";

jest.mock("@/lib/shortener-link", () => ({
  encodeLink: () => "xK3mP9aQ",
}));

const mockPrismaService = {
  shortLink: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

jest.mock("nanoid", () => ({
  customAlphabet: () => () => "xK3mP9aQ",
}));

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe("ShortenerService", () => {
  let service: ShortenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShortenerService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ShortenerService>(ShortenerService);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createShortLink", () => {
    it("should create and return short link", async () => {
      const url = "https://seismic-scope.vercel.app/dashboard";
      const createdLink = {
        id: 1,
        code: "",
        url,
        clicks: 0,
        createdAt: new Date(),
        expiresAt: new Date(),
      };
      const updatedLink = { ...createdLink, code: "xK3mP9aQ" };

      mockPrismaService.shortLink.create.mockResolvedValue(createdLink);
      mockPrismaService.shortLink.update.mockResolvedValue(updatedLink);

      const result = await service.createShortLink({ url });

      expect(mockPrismaService.shortLink.create).toHaveBeenCalledWith({
        data: { url, code: "", expiresAt: expect.any(Date) },
      });
      expect(mockPrismaService.shortLink.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { code: expect.any(String) },
      });
      expect(result).toEqual(updatedLink);
    });
  });

  describe("redirect", () => {
    it("should return URL from Redis cache if exists", async () => {
      const code = "xK3mP9aQ";
      const url = "https://seismic-scope.vercel.app/dashboard";

      mockRedisService.get.mockResolvedValue(url);
      mockPrismaService.shortLink.update.mockResolvedValue({});

      const result = await service.redirect(code);

      expect(mockRedisService.get).toHaveBeenCalledWith(`shortlink:${code}`);
      expect(mockPrismaService.shortLink.findUnique).not.toHaveBeenCalled();
      expect(result).toBe(url);
    });

    it("should return URL from DB and cache it when not in Redis", async () => {
      const code = "xK3mP9aQ";
      const url = "https://seismic-scope.vercel.app/dashboard";
      const link = { id: 1, code, url, clicks: 0, createdAt: new Date() };

      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.shortLink.findUnique.mockResolvedValue(link);
      mockPrismaService.shortLink.update.mockResolvedValue({});

      const result = await service.redirect(code);

      expect(mockPrismaService.shortLink.findUnique).toHaveBeenCalledWith({
        where: { code },
      });
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `shortlink:${code}`,
        url,
        86400,
      );
      expect(result).toBe(url);
    });

    it("should return null when code not found", async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.shortLink.findUnique.mockResolvedValue(null);

      const result = await service.redirect("invalid");

      expect(result).toBeNull();
    });

    it("should increment clicks when returning from cache", async () => {
      const code = "xK3mP9aQ";
      mockRedisService.get.mockResolvedValue("https://example.com");
      mockPrismaService.shortLink.update.mockResolvedValue({});

      await service.redirect(code);

      expect(mockPrismaService.shortLink.update).toHaveBeenCalledWith({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
    });

    it("should increment clicks when returning from DB", async () => {
      const code = "xK3mP9aQ";
      const link = {
        id: 1,
        code,
        url: "https://example.com",
        clicks: 0,
        createdAt: new Date(),
      };

      mockRedisService.get.mockResolvedValue(null);
      mockPrismaService.shortLink.findUnique.mockResolvedValue(link);
      mockPrismaService.shortLink.update.mockResolvedValue({});

      await service.redirect(code);

      expect(mockPrismaService.shortLink.update).toHaveBeenCalledWith({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
    });
  });
});
