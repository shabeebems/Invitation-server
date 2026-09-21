import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { uploadCategoryImageMiddleware } from "../middleware/upload";

const categoryController = new CategoryController();
const categoryRouter = Router();

categoryRouter.get("/", (req, res) => categoryController.list(req, res));
categoryRouter.post("/", uploadCategoryImageMiddleware, (req, res) =>
  categoryController.create(req, res)
);
categoryRouter.put("/:id", uploadCategoryImageMiddleware, (req, res) =>
  categoryController.update(req, res)
);

export default categoryRouter;
