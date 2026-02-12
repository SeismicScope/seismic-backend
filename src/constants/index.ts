import type { Prisma } from "@prisma/client";

import type { SortOption } from "@/modules/earthquakes/dto/get-earthquakes.dto";

export const DEFAULT_EARTHQUAKE_LIMIT = 50;
export const SRID = 4326; // Spatial Reference Identifier, WGS 84
export const DB_EARTHQUAKE_NAME = "Earthquake";

export const SORT_MAP: Record<
  SortOption,
  Prisma.EarthquakeOrderByWithRelationInput
> = {
  date_asc: { occurredAt: "asc" },
  date_desc: { occurredAt: "desc" },
  magnitude_asc: { magnitude: "asc" },
  magnitude_desc: { magnitude: "desc" },
  depth_asc: { depth: "asc" },
  depth_desc: { depth: "desc" },
};
