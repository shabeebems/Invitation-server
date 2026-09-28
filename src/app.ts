import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes";
import errorHandler from "./middlewares/error.middleware";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", routes);
app.use(errorHandler);

export default app;
