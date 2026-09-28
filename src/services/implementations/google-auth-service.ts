import { inject, injectable } from "inversify";
import { UnauthorizedError } from "../../common/errors";
import TYPES from "../../constants/types";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import { AuthSession, RequestMeta } from "../interfaces/auth-service.interface";
import { welcomeEmail } from "../email/email-templates";
import IEmailSender from "../interfaces/email-sender.interface";
import IGoogleAuthService from "../interfaces/google-auth-service.interface";
import IGoogleIdentityProvider from "../interfaces/google-identity.interface";
import ISessionService from "../interfaces/session-service.interface";

@injectable()
export default class GoogleAuthService implements IGoogleAuthService {
  constructor(
    @inject(TYPES.IGoogleIdentityProvider) private readonly google: IGoogleIdentityProvider,
    @inject(TYPES.IUserRepository) private readonly users: IUserRepository,
    @inject(TYPES.ISessionService) private readonly sessions: ISessionService,
    @inject(TYPES.IEmailSender) private readonly email: IEmailSender
  ) {}

  async login(credential: string, meta: RequestMeta): Promise<AuthSession> {
    const identity = await this.google.verify(credential);

    if (!identity.emailVerified) {
      throw new UnauthorizedError("Google sign-in could not be verified");
    }

    const linked = await this.users.findByGoogleId(identity.providerAccountId);

    if (linked) {
      return this.sessions.issue(linked, meta);
    }

    const existing = await this.users.findByEmail(identity.email);

    if (existing) {
      if (!existing.googleId) {
        await this.users.setGoogleId(String(existing._id), identity.providerAccountId);
        existing.googleId = identity.providerAccountId;
      }

      if (!existing.emailVerified) {
        await this.users.setEmailVerified(String(existing._id));
        existing.emailVerified = true;
      }

      return this.sessions.issue(existing, meta);
    }

    const user = await this.users.create({
      name: identity.name,
      email: identity.email,
      googleId: identity.providerAccountId,
      role: "customer",
      emailVerified: true,
    });

    const origin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
    await this.email.send({
      to: user.email,
      ...welcomeEmail(user.name, origin),
    });

    return this.sessions.issue(user, meta);
  }
}
