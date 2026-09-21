import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const dashboardController = new DashboardController();
const dashboardRouter = Router();

dashboardRouter.get("/", (req, res) => dashboardController.show(req, res));

export default dashboardRouter;
