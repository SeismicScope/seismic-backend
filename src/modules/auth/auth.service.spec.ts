import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import bcrypt from "bcrypt";
import { PrismaService } from "prisma/prisma.service";

import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe("login", () => {
    const hashedPassword = bcrypt.hashSync("secret123", 10);

    const mockUser = {
      id: 1,
      username: "admin",
      passwordHash: hashedPassword,
      role: "admin",
    };

    it("should return access_token for valid credentials", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("jwt-token-123");

      const result = await service.login({
        username: "admin",
        password: "secret123",
      });

      expect(result).toEqual({ access_token: "jwt-token-123" });
    });

    it("should sign payload with username and role from DB", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("token");

      await service.login({ username: "admin", password: "secret123" });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        name: "admin",
        role: "admin",
      });
    });

    it("should throw UnauthorizedException for non-existent user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ username: "wrong", password: "secret123" }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException for invalid password", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.login({ username: "admin", password: "wrong" }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
