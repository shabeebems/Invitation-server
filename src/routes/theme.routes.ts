import { Router } from "express";
import { ThemeController } from "../controllers/theme.controller";

const themeController = new ThemeController();
const themeRouter = Router();

themeRouter.get("/", (req, res) => themeController.list(req, res));

export default themeRouter;
