import { IUser } from "../../models/user.model";
import { RequestMeta } from "./auth-service.interface";

export default interface IEmailVerificationService {
  issue(user: IUser, meta: RequestMeta): Promise<void>;
  verify(token: string): Promise<void>;
  resend(email: string, meta: RequestMeta): Promise<void>;
}
