import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import IWorkController from "../controllers/interfaces/work-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";
import { uploadImageMiddleware } from "../middlewares/upload.middleware";

const workController = container.get<IWorkController>(TYPES.IWorkController);
const workRouter = Router();

workRouter.get(
  "/",
  requireAdmin,
  asyncHandler((req, res) => workController.list(req, res))
);
workRouter.post(
  "/",
  requireAdmin,
  asyncHandler((req, res) => workController.create(req, res))
);
workRouter.get(
  "/:slug",
  asyncHandler((req, res) => workController.show(req, res))
);
workRouter.put(
  "/:slug/theme",
  asyncHandler((req, res) => workController.selectTheme(req, res))
);
workRouter.put(
  "/:slug",
  requireAdmin,
  uploadImageMiddleware,
  asyncHandler((req, res) => workController.update(req, res))
);

export default workRouter;
