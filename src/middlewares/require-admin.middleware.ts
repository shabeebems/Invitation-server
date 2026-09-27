import { RequestHandler } from "express";
import { ForbiddenError } from "../common/errors";
import requireUser, { AuthLocals } from "./require-user.middleware";

const requireAdmin: RequestHandler = (req, res, next) => {
  requireUser(req, res, (error) => {
    if (error) {
      next(error);
      return;
    }

    const auth = res.locals.auth as AuthLocals;

    if (auth.role !== "admin") {
      next(new ForbiddenError("Admin access required"));
      return;
    }

    next();
  });
};

export default requireAdmin;
