import { RequestHandler } from "express";
import { ForbiddenError } from "../common/errors";
import { allowedClientOrigins } from "../common/http/client-origins";

/**
 * CSRF defense for cookie-authenticated mutating requests.
 * Browsers send Origin; production requires it to match CLIENT_ORIGINS.
 */
const requireClientOrigin: RequestHandler = (req, _res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    next();
    return;
  }

  const origin = typeof req.headers.origin === "string" ? req.headers.origin : "";
  const allowed = allowedClientOrigins();

  if (!origin) {
    if (process.env.NODE_ENV === "production") {
      next(new ForbiddenError("Request origin is required"));
      return;
    }
    next();
    return;
  }

  if (!allowed.includes(origin)) {
    next(new ForbiddenError("Request origin is not allowed"));
    return;
  }

  next();
};

export default requireClientOrigin;
