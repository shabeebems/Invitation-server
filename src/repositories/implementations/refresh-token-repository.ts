import { injectable } from "inversify";
import { IRefreshToken, RefreshTokenModel } from "../../models/refresh-token.model";
import IRefreshTokenRepository, { SessionMeta } from "../interfaces/refresh-token-repository.interface";

@injectable()
export default class RefreshTokenRepository implements IRefreshTokenRepository {
  create(userId: string, tokenHash: string, expiresAt: Date, meta: SessionMeta): Promise<IRefreshToken> {
    return RefreshTokenModel.create({
      userId,
      tokenHash,
      expiresAt,
      userAgent: meta.userAgent,
      ip: meta.ip,
      lastUsedAt: new Date(),
    });
  }

  consumeValid(tokenHash: string): Promise<IRefreshToken | null> {
    return RefreshTokenModel.findOneAndUpdate(
      { tokenHash, revokedAt: null, expiresAt: { $gt: new Date() } },
      { revokedAt: new Date(), lastUsedAt: new Date() },
      { new: false }
    );
  }

  findByHash(tokenHash: string): Promise<IRefreshToken | null> {
    return RefreshTokenModel.findOne({ tokenHash });
  }

  async markReplaced(id: string, replacedBy: string): Promise<void> {
    await RefreshTokenModel.updateOne({ _id: id }, { replacedBy });
  }

  listForUser(userId: string): Promise<IRefreshToken[]> {
    return RefreshTokenModel.find({ userId, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({
      createdAt: -1,
    });
  }

  async revokeById(userId: string, sessionId: string): Promise<boolean> {
    const result = await RefreshTokenModel.updateOne(
      { _id: sessionId, userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    return result.modifiedCount === 1;
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
  }

  async touch(id: string): Promise<void> {
    await RefreshTokenModel.updateOne({ _id: id }, { lastUsedAt: new Date() });
  }
}
