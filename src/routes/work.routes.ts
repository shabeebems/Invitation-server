import { Router } from "express";
import { WorkController } from "../controllers/work.controller";
import { uploadImageMiddleware } from "../middleware/upload";

const workController = new WorkController();
const workRouter = Router();

workRouter.get("/", (req, res) => workController.list(req, res));
workRouter.post("/", (req, res) => workController.create(req, res));
workRouter.get("/:slug", (req, res) => workController.show(req, res));
workRouter.put("/:slug/theme", (req, res) => workController.selectTheme(req, res));
workRouter.put("/:slug", uploadImageMiddleware, (req, res) => workController.update(req, res));

export default workRouter;
