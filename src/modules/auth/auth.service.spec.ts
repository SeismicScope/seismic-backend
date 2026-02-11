import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";

import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return access_token", () => {
      mockJwtService.sign.mockReturnValue("jwt-token-123");

      const result = service.login();

      expect(result).toEqual({ access_token: "jwt-token-123" });
    });

    it("should sign payload with name and role", () => {
      mockJwtService.sign.mockReturnValue("token");

      service.login();

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        name: "Admin",
        role: "admin",
      });
    });

    it("should call jwtService.sign exactly once", () => {
      mockJwtService.sign.mockReturnValue("token");

      service.login();

      expect(mockJwtService.sign).toHaveBeenCalledTimes(1);
    });
  });
});
