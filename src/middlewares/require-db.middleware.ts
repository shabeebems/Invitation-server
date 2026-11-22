import { RequestHandler } from "express";
import { isDbReady } from "../config/db";

/** Fail fast when Mongo is down instead of buffering queries for ~10s. */
export const requireDb: RequestHandler = (_req, res, next) => {
  if (isDbReady()) {
    next();
    return;
  }

  res.status(503).json({
    success: false,
    message: "Database unavailable",
  });
};

export default requireDb;
