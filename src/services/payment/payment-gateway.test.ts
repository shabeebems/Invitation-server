import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import RazorpayGateway from "../implementations/razorpay-gateway";

function withoutRazorpayEnv(run: () => void | Promise<void>) {
  const previous = {
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
  };

  delete process.env.RAZORPAY_KEY_ID;
  delete process.env.RAZORPAY_KEY_SECRET;
  delete process.env.RAZORPAY_WEBHOOK_SECRET;

  return Promise.resolve(run()).finally(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });
}

test("RazorpayGateway: detects mock mode when credentials are placeholders", async () => {
  await withoutRazorpayEnv(() => {
    const gateway = new RazorpayGateway();
    assert.equal(gateway.isMock(), true);
    assert.equal(gateway.getKeyId(), "rzp_test_placeholder");
  });
});

test("RazorpayGateway: creates mock order with expected fields in mock mode", async () => {
  await withoutRazorpayEnv(async () => {
    const gateway = new RazorpayGateway();
    const order = await gateway.createOrder({
      amount: 49900,
      currency: "INR",
      receipt: "ORD-TEST-123",
    });

    assert.equal(order.amount, 49900);
    assert.equal(order.currency, "INR");
    assert.equal(order.receipt, "ORD-TEST-123");
    assert.match(order.gatewayOrderId, /^order_mock_/);
  });
});

test("RazorpayGateway: verifies HMAC-SHA256 signatures with constant-time equality", async () => {
  await withoutRazorpayEnv(() => {
    const gateway = new RazorpayGateway();
    const orderId = "order_123456";
    const paymentId = "pay_987654";
    const secret = "rzp_secret_placeholder";

    const validSignature = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");

    assert.equal(
      gateway.verifyPaymentSignature(orderId, paymentId, validSignature),
      true,
      "Valid HMAC signature must pass"
    );

    const tamperedSignature = validSignature.replace(/.$/, "0");
    assert.equal(
      gateway.verifyPaymentSignature(orderId, paymentId, tamperedSignature),
      false,
      "Tampered HMAC signature must be rejected"
    );
  });
});

test("RazorpayGateway: verifies mock signature in mock mode", async () => {
  await withoutRazorpayEnv(() => {
    const gateway = new RazorpayGateway();
    assert.equal(gateway.verifyPaymentSignature("order_mock_1", "pay_mock_1", "mock_signature"), true);
    assert.equal(
      gateway.verifyPaymentSignature("order_mock_1", "pay_abc", "not-a-real-signature"),
      true,
      "Mock orders should verify in placeholder mode"
    );
  });
});
