import type { CsvRow, TransformedEarthquakeRow } from "@/types";

export function transformRow(row: CsvRow): TransformedEarthquakeRow | null {
  const date = new Date(row.time);
  const latitude = parseFloat(row.latitude);
  const longitude = parseFloat(row.longitude);

  if (isNaN(date.getTime()) || isNaN(latitude) || isNaN(longitude) || !row.id) {
    return null;
  }

  return {
    occurredAt: date,
    magnitude: parseFloat(row.mag) || 0,
    depth: parseFloat(row.depth) || 0,
    latitude,
    longitude,
    location: row.location || "",
    externalId: row.id,
  };
}
