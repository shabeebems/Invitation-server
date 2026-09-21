import { Router } from "express";
import { TemplateController } from "../controllers/template.controller";
import { uploadImageMiddleware } from "../middleware/upload";

const templateController = new TemplateController();
const templateRouter = Router();

templateRouter.get("/", (req, res) => templateController.list(req, res));
templateRouter.get("/:slug", (req, res) => templateController.show(req, res));
templateRouter.put("/:slug/theme", (req, res) => templateController.selectTheme(req, res));
templateRouter.put("/:slug", uploadImageMiddleware, (req, res) =>
  templateController.update(req, res)
);

export default templateRouter;
