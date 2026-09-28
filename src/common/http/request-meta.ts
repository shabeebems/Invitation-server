import { Request } from "express";
import { RequestMeta } from "../../services/interfaces/auth-service.interface";

export function requestMeta(req: Request): RequestMeta {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip || "";

  return {
    ip,
    userAgent: String(req.headers["user-agent"] || "").slice(0, 300),
  };
}
