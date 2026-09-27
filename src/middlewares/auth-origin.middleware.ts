import { RequestHandler } from "express";
import { ForbiddenError } from "../common/errors";

const authOrigin: RequestHandler = (req, _res, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    next();
    return;
  }

  const origin = req.headers.origin;
  const allowed = process.env.CLIENT_ORIGIN || "http://localhost:3000";

  if (origin && origin !== allowed) {
    next(new ForbiddenError("Request origin is not allowed"));
    return;
  }

  next();
};

export default authOrigin;
