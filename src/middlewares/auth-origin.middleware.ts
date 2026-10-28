import { RequestHandler } from "express";
import { ForbiddenError } from "../common/errors";
import { allowedClientOrigins } from "../common/http/client-origins";

const authOrigin: RequestHandler = (req, _res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;
  const allowed = allowedClientOrigins();

  if (origin && !allowed.includes(origin)) {
    next(new ForbiddenError("Request origin is not allowed"));
    return;
  }

  next();
};

export default authOrigin;
