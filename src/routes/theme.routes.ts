import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import IThemeController from "../controllers/interfaces/theme-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";

const themeController = container.get<IThemeController>(TYPES.IThemeController);
const themeRouter = Router();

themeRouter.get(
  "/",
  requireAdmin,
  asyncHandler((req, res) => themeController.list(req, res))
);

export default themeRouter;
