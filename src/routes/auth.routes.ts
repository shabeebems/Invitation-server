import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import AccountSecurityController from "../controllers/implementations/account-security-controller";
import AuthController from "../controllers/implementations/auth-controller";
import GoogleAuthController from "../controllers/implementations/google-auth-controller";
import SessionController from "../controllers/implementations/session-controller";
import asyncHandler from "../middlewares/async.middleware";
import authOrigin from "../middlewares/auth-origin.middleware";
import { rateLimit } from "../middlewares/rate-limit.middleware";
import requireUser from "../middlewares/require-user.middleware";

const auth = container.get<AuthController>(TYPES.IAuthController);
const google = container.get<GoogleAuthController>(TYPES.IGoogleAuthController);
const security = container.get<AccountSecurityController>(TYPES.IAccountSecurityController);
const sessions = container.get<SessionController>(TYPES.ISessionController);
const authRouter = Router();
const quarterHour = 15 * 60 * 1000;
const hour = 60 * 60 * 1000;

authRouter.use(authOrigin);
authRouter.post("/signup", rateLimit("signup", 10, hour), asyncHandler((req, res) => auth.signup(req, res)));
authRouter.post("/login", rateLimit("login", 20, quarterHour), asyncHandler((req, res) => auth.login(req, res)));
authRouter.post("/google", rateLimit("google", 20, quarterHour), asyncHandler((req, res) => google.login(req, res)));
authRouter.post("/refresh", rateLimit("refresh", 60, quarterHour), asyncHandler((req, res) => auth.refresh(req, res)));
authRouter.post("/logout", asyncHandler((req, res) => auth.logout(req, res)));
authRouter.get("/me", asyncHandler((req, res) => auth.me(req, res)));
authRouter.post(
  "/forgot-password",
  rateLimit("forgot", 5, hour),
  asyncHandler((req, res) => security.forgotPassword(req, res))
);
authRouter.post(
  "/reset-password",
  rateLimit("reset", 10, hour),
  asyncHandler((req, res) => security.resetPassword(req, res))
);
authRouter.post(
  "/verify-email",
  rateLimit("verify", 10, hour),
  asyncHandler((req, res) => security.verifyEmail(req, res))
);
authRouter.post(
  "/resend-verification",
  rateLimit("resend", 5, hour),
  asyncHandler((req, res) => security.resendVerification(req, res))
);
authRouter.post(
  "/change-password",
  requireUser,
  asyncHandler((req, res) => security.changePassword(req, res))
);
authRouter.get("/sessions", requireUser, asyncHandler((req, res) => sessions.list(req, res)));
authRouter.delete("/sessions", requireUser, asyncHandler((req, res) => sessions.revokeAll(req, res)));
authRouter.delete("/sessions/:sessionId", requireUser, asyncHandler((req, res) => sessions.revoke(req, res)));

export default authRouter;
