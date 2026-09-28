import { Request, Response } from "express";

export default interface ITemplateController {
  list(req: Request, res: Response): Promise<void>;
  show(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  selectTheme(req: Request, res: Response): Promise<void>;
}
