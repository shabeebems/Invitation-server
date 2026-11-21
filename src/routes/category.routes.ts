import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import ICategoryController from "../controllers/interfaces/category-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import optionalUser from "../middlewares/optional-user.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";
import requireClientOrigin from "../middlewares/require-client-origin.middleware";
import { uploadImageMiddleware } from "../middlewares/upload.middleware";

const categoryController = container.get<ICategoryController>(TYPES.ICategoryController);
const categoryRouter = Router();

categoryRouter.get(
  "/",
  optionalUser,
  asyncHandler((req, res) => categoryController.list(req, res))
);
categoryRouter.post(
  "/",
  requireClientOrigin,
  requireAdmin,
  uploadImageMiddleware,
  asyncHandler((req, res) => categoryController.create(req, res))
);
categoryRouter.put(
  "/:id",
  requireClientOrigin,
  requireAdmin,
  uploadImageMiddleware,
  asyncHandler((req, res) => categoryController.update(req, res))
);

export default categoryRouter;
