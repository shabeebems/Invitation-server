import { Request, Response } from "express";

export default interface ICategoryController {
  list(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
}
