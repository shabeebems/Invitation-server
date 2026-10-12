import { Request, Response } from "express";

export default interface IUserAdminController {
  list(req: Request, res: Response): Promise<void>;
}
