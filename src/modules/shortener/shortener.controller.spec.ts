import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Response } from "express";

import { CreateShortenerDto } from "./dto/create-shortener.dto";
import { ShortenerController } from "./shortener.controller";
import { ShortenerService } from "./shortener.service";

const mockShortenerService = {
  createShortLink: jest.fn(),
  redirect: jest.fn(),
};
jest.mock("@/lib/shortener-link", () => ({
  encodeLink: () => "xK3mP9aQ",
}));

const mockResponse: Partial<Response> = {
  status: jest.fn().mockReturnThis(),
  redirect: jest.fn().mockReturnThis(),
};

describe("ShortenerController", () => {
  let controller: ShortenerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShortenerController],
      providers: [
        { provide: ShortenerService, useValue: mockShortenerService },
      ],
    }).compile();

    controller = module.get<ShortenerController>(ShortenerController);
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a short link", async () => {
      const dto: CreateShortenerDto = {
        url: "https://seismic-scope.vercel.app/dashboard",
      };
      const result = {
        id: 1,
        code: "xK3mP9aQ",
        url: dto.url,
        clicks: 0,
        createdAt: new Date(),
      };

      mockShortenerService.createShortLink.mockResolvedValue(result);

      const response = await controller.create(dto);

      expect(mockShortenerService.createShortLink).toHaveBeenCalledWith(dto);
      expect(response).toEqual(result);
    });
  });

  describe("redirect", () => {
    it("should redirect to original URL", async () => {
      const code = "xK3mP9aQ";
      const url = "https://seismic-scope.vercel.app/dashboard";

      mockShortenerService.redirect.mockResolvedValue(url);

      await controller.redirect(code, mockResponse as Response);

      expect(mockShortenerService.redirect).toHaveBeenCalledWith(code);
      expect(mockResponse.status).toHaveBeenCalledWith(302);
      expect(mockResponse.redirect).toHaveBeenCalledWith(url);
    });

    it("should throw NotFoundException when code not found", async () => {
      mockShortenerService.redirect.mockResolvedValue(null);

      await expect(
        controller.redirect("invalid", mockResponse as Response),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
