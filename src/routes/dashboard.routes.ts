import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import IDashboardController from "../controllers/interfaces/dashboard-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";

const dashboardController = container.get<IDashboardController>(TYPES.IDashboardController);
const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  requireAdmin,
  asyncHandler((req, res) => dashboardController.show(req, res))
);

export default dashboardRouter;
