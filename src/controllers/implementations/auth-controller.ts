import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import {
  accessCookie,
  clearAuthCookies,
  refreshCookie,
  setAuthCookies,
} from "../../common/http/auth-cookies";
import { requestMeta } from "../../common/http/request-meta";
import { UnauthorizedError } from "../../common/errors";
import TYPES from "../../constants/types";
import type IAuthService from "../../services/interfaces/auth-service.interface";
import type ISessionService from "../../services/interfaces/session-service.interface";
import IAuthController from "../interfaces/auth-controller.interface";

@injectable()
export default class AuthController implements IAuthController {
  constructor(
    @inject(TYPES.IAuthService) private readonly authService: IAuthService,
    @inject(TYPES.ISessionService) private readonly sessions: ISessionService
  ) {}

  async signup(req: Request, res: Response): Promise<void> {
    const session = await this.authService.signup(
      { name: req.body?.name, email: req.body?.email, password: req.body?.password },
      requestMeta(req)
    );
    setAuthCookies(res, session.accessToken, session.refreshToken);
    res.status(201).json({ success: true, user: session.user });
  }

  async login(req: Request, res: Response): Promise<void> {
    const session = await this.authService.login(
      { email: req.body?.email, password: req.body?.password },
      requestMeta(req)
    );
    setAuthCookies(res, session.accessToken, session.refreshToken);
    res.status(200).json({ success: true, user: session.user });
  }

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = refreshCookie(req.headers.cookie);

    if (!refreshToken) {
      res.status(200).json({ success: false });
      return;
    }

    try {
      const session = await this.sessions.rotate(refreshToken, requestMeta(req));
      setAuthCookies(res, session.accessToken, session.refreshToken);
      res.status(200).json({ success: true, user: session.user });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        clearAuthCookies(res);
        res.status(200).json({ success: false });
        return;
      }

      throw error;
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    await this.sessions.logout(refreshCookie(req.headers.cookie));
    clearAuthCookies(res);
    res.status(200).json({ success: true });
  }

  async me(req: Request, res: Response): Promise<void> {
    const token = accessCookie(req.headers.cookie);

    if (!token) {
      res.status(200).json({ success: true, user: null });
      return;
    }

    try {
      const user = await this.authService.me(token);
      res.status(200).json({ success: true, user });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        res.status(200).json({ success: true, user: null });
        return;
      }

      throw error;
    }
  }
}
