import { RequestHandler } from "express";
import { accessCookie } from "../common/http/auth-cookies";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import ITokenService from "../services/interfaces/token-service.interface";
import IUserRepository from "../repositories/interfaces/user-repository.interface";
import type { AuthLocals } from "./require-user.middleware";

/** Attaches `res.locals.auth` when a valid access cookie is present; otherwise continues as a guest. */
const optionalUser: RequestHandler = async (req, res, next) => {
  try {
    const token = accessCookie(req.headers.cookie);

    if (!token) {
      next();
      return;
    }

    const tokens = container.get<ITokenService>(TYPES.ITokenService);
    const users = container.get<IUserRepository>(TYPES.IUserRepository);
    const payload = tokens.verifyAccess(token);
    const user = await users.findById(payload.sub);

    if (!user) {
      next();
      return;
    }

    const role = user.role === "admin" || user.isAdmin ? "admin" : "customer";
    res.locals.auth = {
      userId: String(user._id),
      sessionId: payload.sessionId,
      role,
      email: user.email,
      emailVerified: Boolean(user.emailVerified),
    } satisfies AuthLocals;
    next();
  } catch {
    next();
  }
};

export default optionalUser;
