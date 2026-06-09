const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const cors = require("cors")({ origin: true });

admin.initializeApp();

exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to make a payment."
    );
  }

  const amount = data.amount;
  if (!amount || typeof amount !== "number" || amount < 100) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Amount must be a number in paise (min 100)."
    );
  }

  try {
    // For LOCAL TESTING use test keys directly here
    // For PRODUCTION use functions.config().razorpay.key_id
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_HERE";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "YOUR_SECRET_HERE";

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };

  } catch (err) {
    console.error("Razorpay order creation error:", err);
    throw new functions.https.HttpsError(
      "internal",
      `Razorpay failed: ${err.message}`
    );
  }
});
