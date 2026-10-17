import { Request, Response } from "express";

export default interface IPaymentController {
  createOrder(req: Request, res: Response): Promise<void>;
  verifyPayment(req: Request, res: Response): Promise<void>;
  handleWebhook(req: Request, res: Response): Promise<void>;
  getOrder(req: Request, res: Response): Promise<void>;
  listOrders(req: Request, res: Response): Promise<void>;
}
