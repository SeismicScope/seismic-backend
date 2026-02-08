import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

import { DB_EARTHQUAKE_NAME } from "@/constants";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async magnitudeDistribution() {
    return this.prisma.$queryRaw`
    SELECT floor(magnitude)::integer as bucket, count(*)::integer as count
    FROM "${DB_EARTHQUAKE_NAME}"
    GROUP BY bucket
    ORDER BY bucket
    `;
  }
}
