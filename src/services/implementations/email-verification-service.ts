import { randomBytes } from "crypto";
import { inject, injectable } from "inversify";
import { BadRequestError } from "../../common/errors";
import TYPES from "../../constants/types";
import { IUser } from "../../models/user.model";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import { RequestMeta } from "../interfaces/auth-service.interface";
import { verificationEmail } from "../email/email-templates";
import IEmailSender from "../interfaces/email-sender.interface";
import IEmailVerificationService from "../interfaces/email-verification-service.interface";
import ITokenService from "../interfaces/token-service.interface";

const TTL_MS = 60 * 60 * 1000;

@injectable()
export default class EmailVerificationService implements IEmailVerificationService {
  constructor(
    @inject(TYPES.IUserRepository) private readonly users: IUserRepository,
    @inject(TYPES.ITokenService) private readonly tokens: ITokenService,
    @inject(TYPES.IEmailSender) private readonly email: IEmailSender
  ) {}

  async issue(user: IUser, _meta: RequestMeta): Promise<void> {
    const raw = randomBytes(32).toString("hex");
    await this.users.setVerifyToken(String(user._id), this.tokens.hash(raw), new Date(Date.now() + TTL_MS));
    const origin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
    await this.email.send({
      to: user.email,
      ...verificationEmail(`${origin}/verify-email?token=${raw}`),
    });
  }

  async verify(token: string): Promise<void> {
    const raw = String(token || "");

    if (!raw) {
      throw new BadRequestError("Verification token is required");
    }

    const user = await this.users.consumeVerifyToken(this.tokens.hash(raw));

    if (!user) {
      throw new BadRequestError("Verification link is invalid or expired");
    }
  }

  async resend(email: string, meta: RequestMeta): Promise<void> {
    const user = await this.users.findByEmail(String(email || "").trim().toLowerCase());

    if (!user || user.emailVerified) {
      return;
    }

    await this.issue(user, meta);
  }
}
