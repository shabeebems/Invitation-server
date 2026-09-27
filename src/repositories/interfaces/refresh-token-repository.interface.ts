import { IRefreshToken } from "../../models/refresh-token.model";

export type SessionMeta = {
  userAgent: string;
  ip: string;
};

export default interface IRefreshTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date, meta: SessionMeta): Promise<IRefreshToken>;
  consumeValid(tokenHash: string): Promise<IRefreshToken | null>;
  findByHash(tokenHash: string): Promise<IRefreshToken | null>;
  markReplaced(id: string, replacedBy: string): Promise<void>;
  listForUser(userId: string): Promise<IRefreshToken[]>;
  revokeById(userId: string, sessionId: string): Promise<boolean>;
  revokeAllForUser(userId: string): Promise<void>;
  touch(id: string): Promise<void>;
}
