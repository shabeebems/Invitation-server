import { RequestHandler } from "express";
import { UnauthorizedError } from "../common/errors";
import { accessCookie } from "../common/http/auth-cookies";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import ITokenService from "../services/interfaces/token-service.interface";
import IUserRepository from "../repositories/interfaces/user-repository.interface";

export type AuthLocals = {
  userId: string;
  sessionId?: string;
  role: "customer" | "admin";
};

const requireUser: RequestHandler = async (req, res, next) => {
  try {
    const token = accessCookie(req.headers.cookie);

    if (!token) {
      throw new UnauthorizedError("Login required");
    }

    const tokens = container.get<ITokenService>(TYPES.ITokenService);
    const users = container.get<IUserRepository>(TYPES.IUserRepository);
    const payload = tokens.verifyAccess(token);
    const user = await users.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedError("Login required");
    }

    const role = user.role === "admin" || user.isAdmin ? "admin" : "customer";
    res.locals.auth = { userId: String(user._id), sessionId: payload.sessionId, role } satisfies AuthLocals;
    next();
  } catch (error) {
    next(error);
  }
};

export default requireUser;
