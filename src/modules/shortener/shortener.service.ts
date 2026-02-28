import { Injectable } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

import { encodeLink } from "@/lib/shortener-link";

import { RedisService } from "../redis/redis.service";
import { CreateShortenerDto } from "./dto/create-shortener.dto";

@Injectable()
export class ShortenerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async createShortLink({ url }: CreateShortenerDto) {
    const link = await this.prisma.shortLink.create({
      data: { url, code: "" },
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

    await this.redis.set(`shortlink:${code}`, link.url, 86400);

    this.prisma.shortLink
      .update({
        where: { code },
        data: { clicks: { increment: 1 } },
      })
      .catch(() => {});

    return link.url;
  }
}
