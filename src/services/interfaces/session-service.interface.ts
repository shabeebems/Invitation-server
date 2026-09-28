import { IUser } from "../../models/user.model";
import { AuthSession, AuthUser } from "./auth-service.interface";
import { SessionMeta } from "../../repositories/interfaces/refresh-token-repository.interface";

export type SessionView = {
  id: string;
  userAgent: string;
  ip: string;
  createdAt: string;
  lastUsedAt: string | null;
  current: boolean;
};

export default interface ISessionService {
  issue(user: IUser, meta: SessionMeta): Promise<AuthSession>;
  rotate(refreshToken: string | undefined, meta: SessionMeta): Promise<AuthSession>;
  logout(refreshToken: string | undefined): Promise<void>;
  logoutAll(userId: string): Promise<void>;
  list(userId: string, currentSessionId?: string): Promise<SessionView[]>;
  revoke(userId: string, sessionId: string): Promise<void>;
  toAuthUser(user: IUser): AuthUser;
}
