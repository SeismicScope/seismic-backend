import { UnauthorizedException } from "@nestjs/common";

import { JwtStrategy } from "./jwt.strategy";

describe("JwtStrategy", () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-key";
    strategy = new JwtStrategy();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe("constructor", () => {
    it("should throw if JWT_SECRET is not defined", () => {
      delete process.env.JWT_SECRET;

      expect(() => new JwtStrategy()).toThrow(
        "JWT_SECRET is not defined in .env",
      );
    });

    it("should create strategy when JWT_SECRET is defined", () => {
      process.env.JWT_SECRET = "my-secret";

      expect(() => new JwtStrategy()).not.toThrow();
    });
  });

  describe("validate", () => {
    it("should return user object from valid payload", async () => {
      const payload = { name: "Admin", role: "admin" };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ name: "Admin", role: "admin" });
    });

    it("should throw UnauthorizedException for null payload", async () => {
      await expect(strategy.validate(null)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException for undefined payload", async () => {
      await expect(strategy.validate(undefined)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should return only name and role from payload", async () => {
      const payload = {
        name: "Admin",
        role: "admin",
        extra: "data",
        iat: 123,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({ name: "Admin", role: "admin" });
      expect(result).not.toHaveProperty("extra");
      expect(result).not.toHaveProperty("iat");
    });
  });
});
