import { Request, RequestHandler, Response } from "express";
import mongoose from "mongoose";
import type { AuthLocals } from "./require-user.middleware";
import { RateLimitModel } from "../models/rate-limit.model";

type Bucket = { count: number; resetAt: number };

const memoryBuckets = new Map<string, Bucket>();
const MEMORY_PRUNE_EVERY = 200;
let memoryOps = 0;

function clientKey(req: Request, res: Response): string {
  const auth = res.locals.auth as AuthLocals | undefined;
  if (auth?.userId) {
    return `user:${auth.userId}`;
  }

  return `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
}

function pruneMemory(now: number) {
  memoryOps += 1;
  if (memoryOps < MEMORY_PRUNE_EVERY) {
    return;
  }
  memoryOps = 0;
  for (const [key, bucket] of memoryBuckets) {
    if (bucket.resetAt <= now) {
      memoryBuckets.delete(key);
    }
  }
}

function takeMemory(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  pruneMemory(now);
  const current = memoryBuckets.get(key);

  if (!current || current.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

async function takeShared(key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = new Date();
  const nextReset = new Date(now.getTime() + windowMs);

  const incremented = await RateLimitModel.findOneAndUpdate(
    { key, resetAt: { $gt: now }, count: { $lt: limit } },
    { $inc: { count: 1 } },
    { new: true }
  );
  if (incremented) {
    return true;
  }

  const restarted = await RateLimitModel.findOneAndUpdate(
    { key, resetAt: { $lte: now } },
    { $set: { count: 1, resetAt: nextReset } },
    { new: true }
  );
  if (restarted) {
    return true;
  }

  try {
    await RateLimitModel.create({ key, count: 1, resetAt: nextReset });
    return true;
  } catch {
    const retry = await RateLimitModel.findOneAndUpdate(
      { key, resetAt: { $gt: now }, count: { $lt: limit } },
      { $inc: { count: 1 } },
      { new: true }
    );
    return Boolean(retry);
  }
}

function useSharedStore(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Fixed-window rate limit.
 * Uses MongoDB when connected (shared across API instances); otherwise in-memory.
 * Keys by authenticated userId when present, else client IP (requires trust proxy).
 */
export function rateLimit(name: string, limit: number, windowMs: number): RequestHandler {
  return (req, res, next) => {
    const key = `${name}:${clientKey(req, res)}`;

    void (async () => {
      try {
        const allowed = useSharedStore()
          ? await takeShared(key, limit, windowMs)
          : takeMemory(key, limit, windowMs);

        if (!allowed) {
          res.status(429).json({ success: false, message: "Too many attempts. Try again later." });
          return;
        }

        next();
      } catch (error) {
        // Prefer availability over hard-failing auth/payment if the store blips.
        console.error("[rate-limit] store error; allowing request", error);
        next();
      }
    })();
  };
}
