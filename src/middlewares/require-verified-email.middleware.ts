import { RequestHandler } from "express";
import { ForbiddenError } from "../common/errors";
import { AuthLocals } from "./require-user.middleware";

/** Blocks unverified customers from pay/publish mutations. Admins are allowed. */
const requireVerifiedEmail: RequestHandler = (req, res, next) => {
  const auth = res.locals.auth as AuthLocals | undefined;

  if (!auth) {
    next(new ForbiddenError("Login required"));
    return;
  }

  if (auth.role === "admin" || auth.emailVerified) {
    next();
    return;
  }

  next(new ForbiddenError("Verify your email before publishing or paying"));
};

export default requireVerifiedEmail;
