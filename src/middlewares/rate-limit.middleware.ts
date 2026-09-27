import { RequestHandler } from "express";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(name: string, limit: number, windowMs: number): RequestHandler {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${name}:${req.ip || "unknown"}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= limit) {
      res.status(429).json({ success: false, message: "Too many attempts. Try again later." });
      return;
    }

    current.count += 1;
    next();
  };
}
