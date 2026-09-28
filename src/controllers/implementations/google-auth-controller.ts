import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { setAuthCookies } from "../../common/http/auth-cookies";
import { requestMeta } from "../../common/http/request-meta";
import TYPES from "../../constants/types";
import IGoogleAuthService from "../../services/interfaces/google-auth-service.interface";

@injectable()
export default class GoogleAuthController {
  constructor(@inject(TYPES.IGoogleAuthService) private readonly google: IGoogleAuthService) {}

  async login(req: Request, res: Response): Promise<void> {
    const session = await this.google.login(String(req.body?.credential || ""), requestMeta(req));
    setAuthCookies(res, session.accessToken, session.refreshToken);
    res.status(200).json({ success: true, user: session.user });
  }
}
