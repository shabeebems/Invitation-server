import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import IWorkController from "../controllers/interfaces/work-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import optionalUser from "../middlewares/optional-user.middleware";
import requireClientOrigin from "../middlewares/require-client-origin.middleware";
import requireUser from "../middlewares/require-user.middleware";
import requireVerifiedEmail from "../middlewares/require-verified-email.middleware";
import { uploadImageMiddleware } from "../middlewares/upload.middleware";

const workController = container.get<IWorkController>(TYPES.IWorkController);
const workRouter = Router();

workRouter.get(
  "/",
  requireUser,
  asyncHandler((req, res) => workController.list(req, res))
);
workRouter.post(
  "/",
  requireClientOrigin,
  requireUser,
  requireVerifiedEmail,
  asyncHandler((req, res) => workController.create(req, res))
);
workRouter.get(
  "/:slug",
  optionalUser,
  asyncHandler((req, res) => workController.show(req, res))
);
workRouter.put(
  "/:slug/theme",
  requireClientOrigin,
  requireUser,
  requireVerifiedEmail,
  asyncHandler((req, res) => workController.selectTheme(req, res))
);
workRouter.put(
  "/:slug",
  requireClientOrigin,
  requireUser,
  requireVerifiedEmail,
  uploadImageMiddleware,
  asyncHandler((req, res) => workController.update(req, res))
);

export default workRouter;
