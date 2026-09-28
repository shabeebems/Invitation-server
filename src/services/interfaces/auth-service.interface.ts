import { UserRole } from "../../models/user.model";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  isAdmin: boolean;
  hasPassword: boolean;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

export type RequestMeta = {
  ip: string;
  userAgent: string;
};

export type SignupInput = {
  name: unknown;
  email: unknown;
  password: unknown;
};

export type LoginInput = {
  email: unknown;
  password: unknown;
};

export default interface IAuthService {
  signup(input: SignupInput, meta: RequestMeta): Promise<AuthSession>;
  login(input: LoginInput, meta: RequestMeta): Promise<AuthSession>;
  me(accessToken: string | undefined): Promise<AuthUser>;
}
