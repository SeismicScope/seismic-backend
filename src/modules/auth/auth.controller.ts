import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtGuard } from "./guards/jwt.guard";
import { OptionalJwtGuard } from "./guards/optional-jwt.guard";
import type { JwtPayload } from "./types";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Throttle({ strict: { ttl: 60_000, limit: 5 } })
  @ApiOperation({ summary: "Login and receive access token cookie" })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.login(dto);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout and clear access token cookie" })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token", {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  }
  @Get("me")
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: "Get current authenticated user" })
  getMe(@Req() req: Request & { user?: JwtPayload }) {
    return req.user ?? null;
  }
}
