import { transformRow } from "./helpers";

describe("transformRow", () => {
  it("should transform a valid CSV row", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "35.05",
      longitude: "139.129",
      id: "us2023abc",
      mag: "6.3",
      depth: "15",
      location: "Near Tokyo, Japan",
    };

    const result = transformRow(row);

    expect(result).toEqual({
      occurredAt: new Date("2023-01-15T10:30:00.000Z"),
      magnitude: 6.3,
      depth: 15,
      latitude: 35.05,
      longitude: 139.129,
      location: "Near Tokyo, Japan",
      externalId: "us2023abc",
    });
  });

  it("should return null for invalid date", () => {
    const row = {
      time: "invalid-date",
      latitude: "35.05",
      longitude: "139.129",
      id: "us2023abc",
      mag: "6.3",
      depth: "15",
      location: "Test",
    };

    expect(transformRow(row)).toBeNull();
  });

  it("should return null for invalid latitude", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "not-a-number",
      longitude: "139.129",
      id: "us2023abc",
      mag: "6.3",
      depth: "15",
      location: "Test",
    };

    expect(transformRow(row)).toBeNull();
  });

  it("should return null for invalid longitude", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "35.05",
      longitude: "abc",
      id: "us2023abc",
      mag: "6.3",
      depth: "15",
      location: "Test",
    };

    expect(transformRow(row)).toBeNull();
  });

  it("should return null if id is missing", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "35.05",
      longitude: "139.129",
      id: "",
      mag: "6.3",
      depth: "15",
      location: "Test",
    };

    expect(transformRow(row)).toBeNull();
  });

  it("should default magnitude to 0 if missing", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "35.05",
      longitude: "139.129",
      id: "us2023abc",
      mag: "",
      depth: "15",
      location: "Test",
    };

    const result = transformRow(row);
    expect(result?.magnitude).toBe(0);
  });

  it("should default depth to 0 if missing", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "35.05",
      longitude: "139.129",
      id: "us2023abc",
      mag: "5.0",
      depth: "",
      location: "Test",
    };

    const result = transformRow(row);
    expect(result?.depth).toBe(0);
  });

  it("should default location to empty string if missing", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "35.05",
      longitude: "139.129",
      id: "us2023abc",
      mag: "5.0",
      depth: "10",
      location: "",
    };

    const result = transformRow(row);
    expect(result?.location).toBe("");
  });

  it("should handle negative coordinates", () => {
    const row = {
      time: "2023-01-15T10:30:00.000Z",
      latitude: "-33.86",
      longitude: "-151.2",
      id: "us2023xyz",
      mag: "4.5",
      depth: "25",
      location: "Near Sydney",
    };

    const result = transformRow(row);
    expect(result?.latitude).toBe(-33.86);
    expect(result?.longitude).toBe(-151.2);
  });
});
