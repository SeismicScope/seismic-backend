import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

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

  @Get("/qr/:code")
  @ApiOperation({ summary: "Get QR code for short link" })
  @ApiParam({ name: "code", example: "xK3mP9aQ" })
  @ApiResponse({ status: 200, description: "Base64 PNG image" })
  async getQR(@Param("code") code: string) {
    const url = await this.shortenerService.redirect(code);
    if (!url) throw new NotFoundException("Short link not found");

    const qr = await this.shortenerService.generateQR(code);

    return { qr };
  }

  @Get("/resolve/:code")
  @ApiOperation({ summary: "Get original URL by code" })
  async resolve(@Param("code") code: string) {
    const url = await this.shortenerService.redirect(code);
    if (!url) throw new NotFoundException("Short link not found");

    return { url };
  }
}
