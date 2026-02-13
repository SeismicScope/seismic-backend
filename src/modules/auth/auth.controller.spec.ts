import { Test, TestingModule } from "@nestjs/testing";
import { Request, Response } from "express";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import type { JwtPayload } from "./types";

describe("AuthController", () => {
  let controller: AuthController;

  const mockService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should set cookie and return success", async () => {
      mockService.login.mockResolvedValue({ access_token: "jwt-token" });

      const mockRes = {
        cookie: jest.fn(),
      } as unknown as Response;

      const dto = { username: "admin", password: "secret123" };
      const result = await controller.login(dto, mockRes);

      expect(result).toEqual({ success: true });
      expect(mockService.login).toHaveBeenCalledWith(dto);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        "access_token",
        "jwt-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "none",
        }),
      );
    });
  });

  describe("logout", () => {
    it("should clear cookie and return success", () => {
      const mockRes = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = controller.logout(mockRes);

      expect(result).toEqual({ success: true });
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        "access_token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "none",
        }),
      );
    });
  });

  describe("getMe", () => {
    it("should return user from request", () => {
      const mockReq = {
        user: { name: "Admin", role: "admin" },
      } as unknown as Request & { user: JwtPayload };

      const result = controller.getMe(mockReq);

      expect(result).toEqual({ name: "Admin", role: "admin" });
    });
  });
});
