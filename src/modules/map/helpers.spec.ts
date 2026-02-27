import { getLimitByZoom } from "./helpers";

describe("getLimitByZoom", () => {
  it("should return MAX_LIMIT when zoom is undefined", () => {
    expect(getLimitByZoom(undefined)).toBe(200_000);
  });

  it("should return 70_000 for zoom <= 4", () => {
    expect(getLimitByZoom(1)).toBe(70_000);
    expect(getLimitByZoom(4)).toBe(70_000);
  });

  it("should return 100_000 for zoom 5-6", () => {
    expect(getLimitByZoom(5)).toBe(100_000);
    expect(getLimitByZoom(6)).toBe(100_000);
  });

  it("should return 150_000 for zoom 7-8", () => {
    expect(getLimitByZoom(7)).toBe(150_000);
    expect(getLimitByZoom(8)).toBe(150_000);
  });

  it("should return MAX_LIMIT for zoom > 8", () => {
    expect(getLimitByZoom(9)).toBe(200_000);
    expect(getLimitByZoom(14)).toBe(200_000);
  });
});
