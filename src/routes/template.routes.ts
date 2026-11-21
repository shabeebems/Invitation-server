import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import ITemplateController from "../controllers/interfaces/template-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import optionalUser from "../middlewares/optional-user.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";
import requireClientOrigin from "../middlewares/require-client-origin.middleware";
import { uploadImageMiddleware } from "../middlewares/upload.middleware";

const templateController = container.get<ITemplateController>(TYPES.ITemplateController);
const templateRouter = Router();

templateRouter.get(
  "/",
  optionalUser,
  asyncHandler((req, res) => templateController.list(req, res))
);
templateRouter.get(
  "/:slug",
  optionalUser,
  asyncHandler((req, res) => templateController.show(req, res))
);
templateRouter.put(
  "/:slug/theme",
  requireClientOrigin,
  requireAdmin,
  asyncHandler((req, res) => templateController.selectTheme(req, res))
);
templateRouter.put(
  "/:slug/pricing",
  requireClientOrigin,
  requireAdmin,
  asyncHandler((req, res) => templateController.updatePricing(req, res))
);
templateRouter.put(
  "/:slug",
  requireClientOrigin,
  requireAdmin,
  uploadImageMiddleware,
  asyncHandler((req, res) => templateController.update(req, res))
);

export default templateRouter;
