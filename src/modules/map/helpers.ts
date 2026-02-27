const MAX_LIMIT = 200_000;

export function getLimitByZoom(zoom?: number): number {
  if (zoom === undefined) return MAX_LIMIT;

  if (zoom <= 4) return 70_000;
  if (zoom <= 6) return 100_000;
  if (zoom <= 8) return 150_000;

  return MAX_LIMIT;
}
