import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import RazorpayGateway from "../implementations/razorpay-gateway";

test("RazorpayGateway: detects mock mode when credentials are placeholders", () => {
  const gateway = new RazorpayGateway();
  assert.equal(gateway.isMock(), true);
  assert.equal(gateway.getKeyId(), "rzp_test_placeholder");
});

test("RazorpayGateway: creates mock order with expected fields in mock mode", async () => {
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

test("RazorpayGateway: verifies HMAC-SHA256 signatures with constant-time equality", () => {
  const gateway = new RazorpayGateway();
  const orderId = "order_123456";
  const paymentId = "pay_987654";
  const secret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder";

  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

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

test("RazorpayGateway: verifies mock signature in mock mode", () => {
  const gateway = new RazorpayGateway();
  assert.equal(
    gateway.verifyPaymentSignature("order_mock_1", "pay_mock_1", "mock_signature"),
    true
  );
});
