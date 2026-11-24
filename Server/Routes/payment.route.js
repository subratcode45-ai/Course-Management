import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../Controllers/payment.controller.js";
import { protect } from "../Middlewares/auth.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
