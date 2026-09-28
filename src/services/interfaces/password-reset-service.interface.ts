import { RequestMeta } from "./auth-service.interface";

export default interface IPasswordResetService {
  request(email: string, meta: RequestMeta): Promise<void>;
  reset(token: string, password: string, meta: RequestMeta): Promise<void>;
  change(userId: string, currentPassword: string, nextPassword: string, meta: RequestMeta): Promise<boolean>;
}
