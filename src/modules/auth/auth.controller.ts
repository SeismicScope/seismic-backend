import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";

import { AuthService } from "./auth.service";
import { JwtGuard } from "./guards/jwt.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Res({ passthrough: true }) res: Response) {
    const { access_token } = this.authService.login();

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "none",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token");

    return { success: true };
  }

  @Get("me")
  @UseGuards(JwtGuard)
  getMe(@Req() req: Request) {
    return (req as any).user;
  }
}
