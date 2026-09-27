import { UserRole } from "../../models/user.model";

export type AccessTokenPayload = {
  sub: string;
  role: UserRole;
  sessionId?: string;
};

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};

export default interface ITokenService {
  signAccess(payload: AccessTokenPayload): string;
  signRefresh(payload: RefreshTokenPayload): string;
  verifyAccess(token: string): AccessTokenPayload;
  verifyRefresh(token: string): RefreshTokenPayload;
  hash(token: string): string;
  newRefreshId(): string;
}
