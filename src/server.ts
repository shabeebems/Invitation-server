import "reflect-metadata";
import "./config/load-env";
import app from "./app";
import { assertProductionConfig } from "./config/assert-production-config";
import { connectDB } from "./config/db";
import container from "./config/inversify.config";
import TYPES from "./constants/types";
import type IPaymentGateway from "./services/interfaces/payment-gateway.interface";

const PORT = Number(process.env.PORT) || 5000;

async function start(): Promise<void> {
  try {
    assertProductionConfig();
    container.get<IPaymentGateway>(TYPES.IPaymentGateway).assertProductionReady();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  try {
    await connectDB();
  } catch (error) {
    console.warn("MongoDB not connected.");
    if (process.env.NODE_ENV === "production") {
      console.error("MongoDB is required in production.");
      process.exit(1);
    }
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
