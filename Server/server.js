import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import authRoutes from "./Routes/auth.route.js";
import courseRoutes from "./Routes/course.route.js";
import enrollRoutes from "./Routes/enroll.route.js";
import connectDB from "./Config/db.js";
import paymentRoutes from "./Routes/payment.route.js";
import uploadRoutes from "./Routes/upload.route.js"

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enroll", enrollRoutes);
app.use("/api/payment", paymentRoutes);
app.use('/uploads', express.static(path.resolve('uploads')));
app.use('/api/upload', uploadRoutes);

app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`Server running on ${process.env.PORT} port.`);
});
