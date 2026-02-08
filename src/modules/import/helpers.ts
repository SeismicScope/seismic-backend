export function transformRow(row: any) {
  return {
    occuredAt: new Date(row.time),
    magnitude: parseFloat(row.mag),
    depth: parseFloat(row.depth),
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
  };
}
