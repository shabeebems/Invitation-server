import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import IUserAdminController from "../controllers/interfaces/user-admin-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import requireAdmin from "../middlewares/require-admin.middleware";

const userAdminController = container.get<IUserAdminController>(TYPES.IUserAdminController);
const userRouter = Router();

userRouter.get(
  "/",
  requireAdmin,
  asyncHandler((req, res) => userAdminController.list(req, res))
);

export default userRouter;
