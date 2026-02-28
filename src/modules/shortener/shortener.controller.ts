import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";

import { CreateShortenerDto } from "./dto/create-shortener.dto";
import { GenerateShortenerResponseDto } from "./dto/generate-shortener-response.dto";
import { ShortenerService } from "./shortener.service";

@ApiTags("Short Link")
@Controller("shortener")
export class ShortenerController {
  constructor(private readonly shortenerService: ShortenerService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate short link" })
  @ApiOkResponse({ type: GenerateShortenerResponseDto })
  create(@Body() createShortenerDto: CreateShortenerDto) {
    return this.shortenerService.createShortLink(createShortenerDto);
  }

  @Get(":code")
  @ApiOperation({ summary: "Redirect to original URL" })
  @ApiParam({ name: "code", example: "aB3kZ9" })
  @ApiResponse({ status: 302, description: "Redirect to original URL" })
  @ApiResponse({ status: 404, description: "Short link not found" })
  async redirect(
    @Param("code") code: string,
    @Res({ passthrough: false }) res: Response,
  ) {
    const url = await this.shortenerService.redirect(code);

    if (!url) throw new NotFoundException("Short link not found");

    res.status(302).redirect(url);
  }

  @Get(":code/qr")
  @ApiOperation({ summary: "Get QR code for short link" })
  @ApiParam({ name: "code", example: "xK3mP9aQ" })
  @ApiResponse({ status: 200, description: "Base64 PNG image" })
  async getQR(@Param("code") code: string) {
    const url = await this.shortenerService.redirect(code);
    if (!url) throw new NotFoundException("Short link not found");

    const qr = await this.shortenerService.generateQR(code);

    return { qr };
  }
}
