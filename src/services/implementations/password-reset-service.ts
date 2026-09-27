import { randomBytes } from "crypto";
import { inject, injectable } from "inversify";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../../common/errors";
import TYPES from "../../constants/types";
import IRefreshTokenRepository from "../../repositories/interfaces/refresh-token-repository.interface";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import { RequestMeta } from "../interfaces/auth-service.interface";
import { passwordResetEmail } from "../email/email-templates";
import IEmailSender from "../interfaces/email-sender.interface";
import IPasswordResetService from "../interfaces/password-reset-service.interface";
import IPasswordService from "../interfaces/password-service.interface";
import ITokenService from "../interfaces/token-service.interface";

const TTL_MS = 60 * 60 * 1000;

@injectable()
export default class PasswordResetService implements IPasswordResetService {
  constructor(
    @inject(TYPES.IUserRepository) private readonly users: IUserRepository,
    @inject(TYPES.IRefreshTokenRepository) private readonly sessions: IRefreshTokenRepository,
    @inject(TYPES.IPasswordService) private readonly passwords: IPasswordService,
    @inject(TYPES.ITokenService) private readonly tokens: ITokenService,
    @inject(TYPES.IEmailSender) private readonly email: IEmailSender
  ) {}

  async request(email: string, _meta: RequestMeta): Promise<void> {
    const user = await this.users.findByEmail(String(email || "").trim().toLowerCase());

    if (!user) {
      throw new NotFoundError("No account found for this email.");
    }

    if (!user.passwordHash) {
      throw new BadRequestError("This email signs in with Google. Continue with Google, or add a password from your profile.");
    }

    const raw = randomBytes(32).toString("hex");
    await this.users.setResetToken(String(user._id), this.tokens.hash(raw), new Date(Date.now() + TTL_MS));
    const origin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
    await this.email.send({
      to: user.email,
      ...passwordResetEmail(`${origin}/reset-password?token=${raw}`),
    });
  }

  async reset(token: string, password: string, _meta: RequestMeta): Promise<void> {
    if (String(password || "").length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    const user = await this.users.consumeResetToken(this.tokens.hash(String(token || "")));

    if (!user) {
      throw new BadRequestError("Reset link is invalid or expired");
    }

    await this.users.setPasswordHash(String(user._id), await this.passwords.hash(password));
    await this.sessions.revokeAllForUser(String(user._id));
  }

  async change(userId: string, currentPassword: string, nextPassword: string, _meta: RequestMeta): Promise<boolean> {
    if (String(nextPassword || "").length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    const existing = await this.users.findById(userId);
    const user = existing ? await this.users.findByEmail(existing.email) : null;

    if (!user) {
      throw new UnauthorizedError("Login required");
    }

    const hadPassword = Boolean(user.passwordHash);

    if (hadPassword) {
      const matches = await this.passwords.compare(String(currentPassword || ""), user.passwordHash);

      if (!matches) {
        throw new UnauthorizedError("Current password is incorrect");
      }
    }

    await this.users.setPasswordHash(userId, await this.passwords.hash(nextPassword));

    if (hadPassword) {
      await this.sessions.revokeAllForUser(userId);
    }

    return hadPassword;
  }
}
