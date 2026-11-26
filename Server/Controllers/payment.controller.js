import razorpay from "../Config/razorpay.js";
import Payment from "../Models/Payment.js";
import Course from "../Models/Course.js";
import Enrollment from "../Models/Enrollment.js"
import crypto from "crypto";

export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // free courses don't need payment
    if (course.price === 0) {
      return res.status(400).json({
        success: false,
        message: "This course is free. Use the enroll endpoint.",
      });
    }

    // don't let the user pay twice
    const alreadyEnrolled = await Enrollment.exists({
      user: req.user._id,
      course: course._id,
    });
    if (alreadyEnrolled) {
      return res.status(409).json({
        success: false,
        message: "You are already enrolled in this course",
      });
    }

    const amount = Math.round(course.price * 100); // paise
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid course price" });
    }

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      // Razorpay allows max 40 characters here
      receipt: `r_${Date.now()}_${req.user._id.toString().slice(-6)}`,
    });

    await Payment.create({
      user: req.user._id,
      course: course._id,
      amount,
      currency: "INR",
      razorpayOrderId: order.id,
      status: "pending",
    });

    // send only what the frontend checkout needs
    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      courseTitle: course.title,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create payment order" });
  }
};

// creates the enrollment if it doesn't exist yet (safe to call twice)
const grantAccess = (userId, courseId) =>
  Enrollment.updateOne(
    { user: userId, course: courseId },
    { $setOnInsert: { purchasedAt: new Date() } },
    { upsert: true }
  );

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment details" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
    });
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment order not found" });
    }

    // already verified: succeed again instead of erroring (handles double clicks and retries)
    if (payment.status === "paid") {
      await grantAccess(payment.user, payment.course);
      return res.json({ success: true, message: "Payment already verified" });
    }

    // 1. signature check
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${payment.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpay_signature, "hex");
    const isValid =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValid) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({ success: false, message: "Invalid payment signature" });
    }

    // 2. confirm with Razorpay that the money really arrived
    let rp = await razorpay.payments.fetch(razorpay_payment_id);

    // if auto-capture is off in your dashboard, the status is "authorized"; capture it
    if (rp.status === "authorized") {
      rp = await razorpay.payments.capture(razorpay_payment_id, payment.amount, payment.currency);
    }

    if (
      rp.order_id !== payment.razorpayOrderId ||
      rp.status !== "captured" ||
      rp.amount !== payment.amount ||
      rp.currency !== payment.currency
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment is not captured or details do not match",
      });
    }

    // 3. mark paid, then give access
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "paid";
    await payment.save();

    await grantAccess(payment.user, payment.course);

    return res.json({ success: true, message: "Payment verified. You are enrolled." });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};