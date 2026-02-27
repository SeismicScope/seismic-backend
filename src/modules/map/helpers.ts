const MAX_LIMIT = 200_000;

export function getLimitByZoom(zoom?: number): number {
  if (zoom === undefined) return MAX_LIMIT;

  if (zoom <= 4) return 70_000;
  if (zoom <= 6) return 100_000;
  if (zoom <= 8) return 150_000;

  return MAX_LIMIT;
}

export function getPercision(zoom: number): number {
  if (zoom <= 4) return 1;
  if (zoom <= 6) return 0.1;
  if (zoom <= 8) return 0.01;

  return 0.001;
}

export function roundCoord(value: number, precision: number): number {
  return Math.round(value / precision) * precision;
}
