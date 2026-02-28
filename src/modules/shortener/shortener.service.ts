import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PrismaService } from "prisma/prisma.service";

import { encodeLink } from "@/lib/shortener-link";

import { RedisService } from "../redis/redis.service";
import { CreateShortenerDto } from "./dto/create-shortener.dto";
import { calculateTTL, getExpiresAtDate } from "./helpers";

@Injectable()
export class ShortenerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredLinks() {
    await this.prisma.shortLink.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  }

  async createShortLink({ url }: CreateShortenerDto) {
    const expiresAt = getExpiresAtDate();

    const link = await this.prisma.shortLink.create({
      data: { url, code: "", expiresAt },
    });

    const code = encodeLink();

    return this.prisma.shortLink.update({
      where: { id: link.id },
      data: { code },
    });
  }

  async redirect(code: string) {
    const cached = await this.redis.get(`shortlink:${code}`);
    if (cached) {
      this.prisma.shortLink
        .update({
          where: { code },
          data: { clicks: { increment: 1 } },
        })
        .catch(() => {});

      return cached as string;
    }

    const link = await this.prisma.shortLink.findUnique({
      where: { code },
    });

    if (!link) return null;

    const ttl = calculateTTL(link.expiresAt);

    await this.redis.set(`shortlink:${code}`, link.url, ttl);

    this.prisma.shortLink
      .update({
        where: { code },
        data: { clicks: { increment: 1 } },
      })
      .catch(() => {});

    return link.url;
  }
}
