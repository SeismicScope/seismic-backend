import { ExecutionContext } from "@nestjs/common";

import type { JwtPayload } from "../types";
import { RolesGuard } from "./roles.guard";

describe("RolesGuard", () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard();
  });

  function createMockContext(
    user?: Partial<JwtPayload> | null,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it("should allow access for admin role", () => {
    const context = createMockContext({ name: "Admin", role: "admin" });

    expect(guard.canActivate(context)).toBe(true);
  });

  it("should deny access for non-admin role", () => {
    const context = createMockContext({ name: "User", role: "user" });

    expect(guard.canActivate(context)).toBe(false);
  });

  it("should deny access when user is undefined", () => {
    const context = createMockContext(undefined);

    expect(guard.canActivate(context)).toBe(false);
  });

  it("should deny access when user is null", () => {
    const context = createMockContext(null);

    expect(guard.canActivate(context)).toBe(false);
  });

  it("should deny access when role is missing", () => {
    const context = createMockContext({ name: "Admin" });

    expect(guard.canActivate(context)).toBe(false);
  });

  it("should deny access for empty role string", () => {
    const context = createMockContext({ name: "User", role: "" });

    expect(guard.canActivate(context)).toBe(false);
  });
});
