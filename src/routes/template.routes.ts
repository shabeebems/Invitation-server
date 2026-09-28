import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import ITemplateController from "../controllers/interfaces/template-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";
import { uploadImageMiddleware } from "../middlewares/upload.middleware";

const templateController = container.get<ITemplateController>(TYPES.ITemplateController);
const templateRouter = Router();

templateRouter.get(
  "/",
  asyncHandler((req, res) => templateController.list(req, res))
);
templateRouter.get(
  "/:slug",
  asyncHandler((req, res) => templateController.show(req, res))
);
templateRouter.put(
  "/:slug/theme",
  asyncHandler((req, res) => templateController.selectTheme(req, res))
);
templateRouter.put(
  "/:slug",
  requireAdmin,
  uploadImageMiddleware,
  asyncHandler((req, res) => templateController.update(req, res))
);

export default templateRouter;
