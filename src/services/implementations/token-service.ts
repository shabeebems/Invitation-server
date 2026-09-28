import { createHash, randomUUID } from "crypto";
import { injectable } from "inversify";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../common/errors";
import { UserRole } from "../../models/user.model";
import ITokenService, {
  AccessTokenPayload,
  RefreshTokenPayload,
} from "../interfaces/token-service.interface";

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

function secret(name: "JWT_ACCESS_SECRET" | "JWT_REFRESH_SECRET"): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

@injectable()
export default class TokenService implements ITokenService {
  signAccess(payload: AccessTokenPayload): string {
    return jwt.sign(payload, secret("JWT_ACCESS_SECRET"), { expiresIn: ACCESS_TTL });
  }

  signRefresh(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, secret("JWT_REFRESH_SECRET"), { expiresIn: REFRESH_TTL });
  }

  verifyAccess(token: string): AccessTokenPayload {
    try {
      const payload = jwt.verify(token, secret("JWT_ACCESS_SECRET")) as jwt.JwtPayload;
      return {
        sub: String(payload.sub),
        role: payload.role as UserRole,
        ...(payload.sessionId ? { sessionId: String(payload.sessionId) } : {}),
      };
    } catch {
      throw new UnauthorizedError("Access token is invalid");
    }
  }

  verifyRefresh(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, secret("JWT_REFRESH_SECRET")) as jwt.JwtPayload;
      return {
        sub: String(payload.sub),
        jti: String(payload.jti),
      };
    } catch {
      throw new UnauthorizedError("Refresh token is invalid");
    }
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }

  newRefreshId(): string {
    return randomUUID();
  }
}
