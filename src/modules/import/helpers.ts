export function transformRow(row: any) {
  const date = new Date(row.time);

  if (isNaN(date.getTime()) || isNaN(parseFloat(row.latitude))) {
    return null;
  }

  return {
    occuredAt: date,
    magnitude: parseFloat(row.mag) || 0,
    depth: parseFloat(row.depth) || 0,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    location: row.place || "",
    externalId: row.id || null,
  };
}
