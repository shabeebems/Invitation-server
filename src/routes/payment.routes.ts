import { Router } from "express";
import container from "../config/inversify.config";
import TYPES from "../constants/types";
import IPaymentController from "../controllers/interfaces/payment-controller.interface";
import asyncHandler from "../middlewares/async.middleware";
import { rateLimit } from "../middlewares/rate-limit.middleware";
import requireUser from "../middlewares/require-user.middleware";

const paymentController = container.get<IPaymentController>(TYPES.IPaymentController);
const paymentRouter = Router();

const minute = 60 * 1000;

paymentRouter.post(
  "/orders",
  requireUser,
  rateLimit("payment-order", 20, minute),
  asyncHandler((req, res) => paymentController.createOrder(req, res))
);

paymentRouter.post(
  "/verify",
  requireUser,
  rateLimit("payment-verify", 30, minute),
  asyncHandler((req, res) => paymentController.verifyPayment(req, res))
);

paymentRouter.post(
  "/webhook",
  asyncHandler((req, res) => paymentController.handleWebhook(req, res))
);

paymentRouter.get(
  "/orders",
  requireUser,
  asyncHandler((req, res) => paymentController.listOrders(req, res))
);

paymentRouter.get(
  "/orders/:orderId",
  requireUser,
  asyncHandler((req, res) => paymentController.getOrder(req, res))
);

export default paymentRouter;
