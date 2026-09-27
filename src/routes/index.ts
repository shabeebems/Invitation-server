import { Router } from "express";
import authRouter from "./auth.routes";
import dashboardRouter from "./dashboard.routes";
import categoryRouter from "./category.routes";
import templateRouter from "./template.routes";
import themeRouter from "./theme.routes";
import workRouter from "./work.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/categories", categoryRouter);
router.use("/templates", templateRouter);
router.use("/themes", themeRouter);
router.use("/works", workRouter);

export default router;
