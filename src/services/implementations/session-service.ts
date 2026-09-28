import { inject, injectable } from "inversify";
import { UnauthorizedError, NotFoundError } from "../../common/errors";
import { guard } from "../../common/helpers/guard";
import TYPES from "../../constants/types";
import { IUser, UserRole } from "../../models/user.model";
import IRefreshTokenRepository from "../../repositories/interfaces/refresh-token-repository.interface";
import { SessionMeta } from "../../repositories/interfaces/refresh-token-repository.interface";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import { AuthSession, AuthUser } from "../interfaces/auth-service.interface";
import ISessionService, { SessionView } from "../interfaces/session-service.interface";
import ITokenService from "../interfaces/token-service.interface";
import { classifyRefreshMiss } from "../auth/refresh-decision";

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function roleOf(user: IUser): UserRole {
  if (user.role === "admin" || user.isAdmin) {
    return "admin";
  }

  return "customer";
}

@injectable()
export default class SessionService implements ISessionService {
  constructor(
    @inject(TYPES.IUserRepository) private readonly users: IUserRepository,
    @inject(TYPES.IRefreshTokenRepository) private readonly sessions: IRefreshTokenRepository,
    @inject(TYPES.ITokenService) private readonly tokens: ITokenService
  ) {}

  toAuthUser(user: IUser): AuthUser {
    const role = roleOf(user);

    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role,
      emailVerified: Boolean(user.emailVerified),
      isAdmin: role === "admin",
      hasPassword: Boolean(user.passwordHash),
    };
  }

  issue(user: IUser, meta: SessionMeta): Promise<AuthSession> {
    return this.createSession(user, meta);
  }

  rotate(refreshToken: string | undefined, meta: SessionMeta): Promise<AuthSession> {
    return guard("Could not refresh session", () => this.rotateSession(refreshToken, meta));
  }

  logout(refreshToken: string | undefined): Promise<void> {
    return guard("Could not log out", async () => {
      if (!refreshToken) {
        return;
      }

      const hash = this.tokens.hash(refreshToken);
      const stored = await this.sessions.findByHash(hash);

      if (stored && !stored.revokedAt) {
        await this.sessions.revokeById(String(stored.userId), String(stored._id));
      }
    });
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessions.revokeAllForUser(userId);
  }

  async list(userId: string, currentSessionId?: string): Promise<SessionView[]> {
    const rows = await this.sessions.listForUser(userId);

    return rows.map((row) => ({
      id: String(row._id),
      userAgent: row.userAgent || "Unknown device",
      ip: row.ip || "",
      createdAt: row.createdAt.toISOString(),
      lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
      current: String(row._id) === currentSessionId,
    }));
  }

  async revoke(userId: string, sessionId: string): Promise<void> {
    const revoked = await this.sessions.revokeById(userId, sessionId);

    if (!revoked) {
      throw new NotFoundError("Session not found");
    }
  }

  private async rotateSession(refreshToken: string | undefined, meta: SessionMeta): Promise<AuthSession> {
    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is missing");
    }

    const payload = this.tokens.verifyRefresh(refreshToken);
    const tokenHash = this.tokens.hash(refreshToken);
    const consumed = await this.sessions.consumeValid(tokenHash);

    if (!consumed || String(consumed.userId) !== payload.sub) {
      const existing = await this.sessions.findByHash(tokenHash);
      const decision = classifyRefreshMiss(existing, Date.now());

      if (decision === "reuse" && existing) {
        await this.sessions.revokeAllForUser(String(existing.userId));
      }

      throw new UnauthorizedError(
        decision === "grace" ? "Refresh already rotated" : "Refresh token is invalid"
      );
    }

    const storedUser = await this.users.findById(payload.sub);
    const user = storedUser ? await this.users.findByEmail(storedUser.email) : null;

    if (!user) {
      throw new UnauthorizedError("Login required");
    }

    const session = await this.createSession(user, meta);
    await this.sessions.markReplaced(String(consumed._id), session.sessionId);
    return session;
  }

  private async createSession(user: IUser, meta: SessionMeta): Promise<AuthSession> {
    const authUser = this.toAuthUser(user);
    const refreshId = this.tokens.newRefreshId();
    const refreshToken = this.tokens.signRefresh({ sub: authUser.id, jti: refreshId });
    const stored = await this.sessions.create(
      authUser.id,
      this.tokens.hash(refreshToken),
      new Date(Date.now() + REFRESH_TTL_MS),
      meta
    );
    const accessToken = this.tokens.signAccess({
      sub: authUser.id,
      role: authUser.role,
      sessionId: String(stored._id),
    });

    return { user: authUser, accessToken, refreshToken, sessionId: String(stored._id) };
  }
}
