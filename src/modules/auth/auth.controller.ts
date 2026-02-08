import { Controller, Post, Res } from "@nestjs/common";
import { Response } from "express";

import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Res({ passthrough: true }) res: Response) {
    const { access_token } = this.authService.login();

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: true };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("access_token");

    return { success: true };
  }
}
