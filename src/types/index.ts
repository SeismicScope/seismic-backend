export type EarthquakeFilterParams = {
  minMag?: number;
  maxMag?: number;
  minDepth?: number;
  maxDepth?: number;
  dateFrom?: Date;
  dateTo?: Date;
};

export type CsvRow = {
  time: string;
  latitude: string;
  longitude: string;
  id: string;
  mag: string;
  depth: string;
  location: string;
};

export type TransformedEarthquakeRow = {
  occurredAt: Date;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  location: string;
  externalId: string;
};

export type MapEarthquake = {
  id: number;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  location: string | null;
  occurredAt: Date;
};
