import { RequestMeta } from "./auth-service.interface";

export type NotificationRecipient = {
  name: string;
  email: string;
};

export type PasswordChange = {
  added: boolean;
  signedOutElsewhere: boolean;
  meta: RequestMeta;
};

/** Best-effort emails: every method resolves even when sending fails, so callers never break on mail errors. */
export default interface INotificationService {
  welcome(user: NotificationRecipient): Promise<void>;
  passwordChanged(user: NotificationRecipient, change: PasswordChange): Promise<void>;
  invitationPublished(workId: string): Promise<void>;
}
