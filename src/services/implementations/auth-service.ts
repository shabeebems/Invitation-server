import { inject, injectable } from "inversify";
import { BadRequestError, ConflictError, UnauthorizedError } from "../../common/errors";
import { guard } from "../../common/helpers/guard";
import TYPES from "../../constants/types";
import IUserRepository from "../../repositories/interfaces/user-repository.interface";
import IAuthService, { AuthSession, AuthUser, LoginInput, RequestMeta, SignupInput } from "../interfaces/auth-service.interface";
import IEmailVerificationService from "../interfaces/email-verification-service.interface";
import IPasswordService from "../interfaces/password-service.interface";
import ISessionService from "../interfaces/session-service.interface";
import ITokenService from "../interfaces/token-service.interface";

function emailOf(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

@injectable()
export default class AuthService implements IAuthService {
  constructor(
    @inject(TYPES.IUserRepository) private readonly users: IUserRepository,
    @inject(TYPES.IPasswordService) private readonly passwords: IPasswordService,
    @inject(TYPES.ITokenService) private readonly tokens: ITokenService,
    @inject(TYPES.ISessionService) private readonly sessions: ISessionService,
    @inject(TYPES.IEmailVerificationService) private readonly verification: IEmailVerificationService
  ) {}

  signup(input: SignupInput, meta: RequestMeta): Promise<AuthSession> {
    return guard("Could not create account", () => this.register(input, meta));
  }

  login(input: LoginInput, meta: RequestMeta): Promise<AuthSession> {
    return guard("Could not log in", () => this.authenticate(input, meta));
  }

  async me(accessToken: string | undefined): Promise<AuthUser> {
    if (!accessToken) {
      throw new UnauthorizedError("Login required");
    }

    const payload = this.tokens.verifyAccess(accessToken);
    const user = await this.users.findByEmail(
      (await this.users.findById(payload.sub))?.email || ""
    );

    if (!user) {
      throw new UnauthorizedError("Login required");
    }

    return this.sessions.toAuthUser(user);
  }

  private async register(input: SignupInput, meta: RequestMeta): Promise<AuthSession> {
    const name = String(input.name || "").trim();
    const email = emailOf(input.email);
    const password = String(input.password || "");

    if (!name) {
      throw new BadRequestError("Name is required");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestError("A valid email is required");
    }

    if (password.length < 8) {
      throw new BadRequestError("Password must be at least 8 characters");
    }

    if (await this.users.findByEmail(email)) {
      throw new ConflictError("An account with this email already exists");
    }

    const user = await this.users.create({
      name,
      email,
      passwordHash: await this.passwords.hash(password),
      role: "customer",
      emailVerified: false,
    });
    await this.verification.issue(user, meta);

    return this.sessions.issue(user, meta);
  }

  private async authenticate(input: LoginInput, _meta: RequestMeta): Promise<AuthSession> {
    const email = emailOf(input.email);
    const password = String(input.password || "");

    if (!email || !password) {
      throw new BadRequestError("Email and password are required");
    }

    const user = await this.users.findByEmail(email);
    const matches = user ? await this.passwords.compare(password, user.passwordHash) : false;

    if (!user || !matches) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return this.sessions.issue(user, _meta);
  }
}
