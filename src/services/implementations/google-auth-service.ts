import { inject, injectable } from "inversify";
import { UnauthorizedError } from "../../common/errors";
import TYPES from "../../constants/types";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import { AuthSession, RequestMeta } from "../interfaces/auth-service.interface";
import IGoogleAuthService from "../interfaces/google-auth-service.interface";
import IGoogleIdentityProvider from "../interfaces/google-identity.interface";
import INotificationService from "../interfaces/notification-service.interface";
import ISessionService from "../interfaces/session-service.interface";

@injectable()
export default class GoogleAuthService implements IGoogleAuthService {
  constructor(
    @inject(TYPES.IGoogleIdentityProvider) private readonly google: IGoogleIdentityProvider,
    @inject(TYPES.IUserRepository) private readonly users: IUserRepository,
    @inject(TYPES.ISessionService) private readonly sessions: ISessionService,
    @inject(TYPES.INotificationService) private readonly notifications: INotificationService
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

    void this.notifications.welcome(user);

    return this.sessions.issue(user, meta);
  }
}
