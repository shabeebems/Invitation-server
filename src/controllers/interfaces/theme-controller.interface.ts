import { Request, Response } from "express";

export default interface IThemeController {
  list(req: Request, res: Response): Promise<void>;
}
