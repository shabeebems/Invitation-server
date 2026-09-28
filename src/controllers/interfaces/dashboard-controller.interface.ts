import { Request, Response } from "express";

export default interface IDashboardController {
  show(req: Request, res: Response): Promise<void>;
}
