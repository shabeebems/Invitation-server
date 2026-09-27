import { AuthSession, RequestMeta } from "./auth-service.interface";

export default interface IGoogleAuthService {
  login(credential: string, meta: RequestMeta): Promise<AuthSession>;
}
