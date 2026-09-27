import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { clearAuthCookies } from "../../common/http/auth-cookies";
import { requestMeta } from "../../common/http/request-meta";
import TYPES from "../../constants/types";
import { AuthLocals } from "../../middlewares/require-user.middleware";
import IEmailVerificationService from "../../services/interfaces/email-verification-service.interface";
import IPasswordResetService from "../../services/interfaces/password-reset-service.interface";

const RESET_MESSAGE = "We sent a reset link to this email. It expires in 1 hour.";
const VERIFY_MESSAGE = "If the account needs verification, a new email is on the way.";

@injectable()
export default class AccountSecurityController {
  constructor(
    @inject(TYPES.IPasswordResetService) private readonly passwords: IPasswordResetService,
    @inject(TYPES.IEmailVerificationService) private readonly verification: IEmailVerificationService
  ) {}

  async forgotPassword(req: Request, res: Response): Promise<void> {
    await this.passwords.request(req.body?.email, requestMeta(req));
    res.status(200).json({ success: true, message: RESET_MESSAGE });
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    await this.passwords.reset(req.body?.token, req.body?.password, requestMeta(req));
    clearAuthCookies(res);
    res.status(200).json({ success: true });
  }

  async changePassword(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const signedOut = await this.passwords.change(
      auth.userId,
      req.body?.currentPassword,
      req.body?.password,
      requestMeta(req)
    );

    if (signedOut) {
      clearAuthCookies(res);
    }

    res.status(200).json({ success: true, signedOut });
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    await this.verification.verify(req.body?.token);
    res.status(200).json({ success: true });
  }

  async resendVerification(req: Request, res: Response): Promise<void> {
    await this.verification.resend(req.body?.email, requestMeta(req));
    res.status(200).json({ success: true, message: VERIFY_MESSAGE });
  }
}
