import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { clearAuthCookies } from "../../common/http/auth-cookies";
import TYPES from "../../constants/types";
import { AuthLocals } from "../../middlewares/require-user.middleware";
import ISessionService from "../../services/interfaces/session-service.interface";

@injectable()
export default class SessionController {
  constructor(@inject(TYPES.ISessionService) private readonly sessions: ISessionService) {}

  async list(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    const sessions = await this.sessions.list(auth.userId, auth.sessionId);
    res.status(200).json({ success: true, sessions });
  }

  async revoke(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    await this.sessions.revoke(auth.userId, req.params.sessionId);
    if (req.params.sessionId === auth.sessionId) {
      clearAuthCookies(res);
    }
    res.status(200).json({ success: true });
  }

  async revokeAll(req: Request, res: Response): Promise<void> {
    const auth = res.locals.auth as AuthLocals;
    await this.sessions.logoutAll(auth.userId);
    clearAuthCookies(res);
    res.status(200).json({ success: true });
  }
}
