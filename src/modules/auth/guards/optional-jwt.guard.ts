import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

import type { JwtPayload } from "../types";

@Injectable()
export class OptionalJwtGuard extends AuthGuard("jwt") {
  override handleRequest<TUser = JwtPayload | null>(
    err: unknown,
    user: TUser,
    _info: unknown,
    _context: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      return null as TUser;
    }

    return user;
  }
}
