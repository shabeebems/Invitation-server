import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import ICategoryController from "../controllers/interfaces/category-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";
import { uploadCategoryImageMiddleware } from "../middlewares/upload.middleware";

const categoryController = container.get<ICategoryController>(TYPES.ICategoryController);
const categoryRouter = Router();

categoryRouter.use(requireAdmin);
categoryRouter.get(
  "/",
  asyncHandler((req, res) => categoryController.list(req, res))
);
categoryRouter.post("/", uploadCategoryImageMiddleware, asyncHandler((req, res) => categoryController.create(req, res)));
categoryRouter.put(
  "/:id",
  uploadCategoryImageMiddleware,
  asyncHandler((req, res) => categoryController.update(req, res))
);

export default categoryRouter;
