import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import errorHandler from "./middlewares/error.middleware";
import { allowedClientOrigins } from "./common/http/client-origins";

const app = express();
const allowedOrigins = allowedClientOrigins();

// So req.ip reflects the real client behind nginx / a load balancer (rate limits, logs).
const trustProxyRaw = process.env.TRUST_PROXY?.trim();
if (trustProxyRaw === "0" || trustProxyRaw?.toLowerCase() === "false") {
  app.set("trust proxy", false);
} else if (trustProxyRaw && /^\d+$/.test(trustProxyRaw)) {
  app.set("trust proxy", Number(trustProxyRaw));
} else {
  app.set("trust proxy", process.env.NODE_ENV === "production" ? 1 : false);
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);
app.use(errorHandler);

export default app;
