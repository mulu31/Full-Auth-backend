import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { errorHandler } from "./middlewares/error.js";

// Routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --- Middlewares ---
app.use(helmet({ contentSecurityPolicy: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" })); // Add body size limit
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Add URL-encoded body parser
app.use(cookieParser());
app.use(morgan("dev"));

// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// --- Health Check ---
app.get("/health", (req, res) =>
  res.json({ status: "OK", message: "Server is running healthy" }),
);

// --- 404 Handler ---
app.use((req, res) =>
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `The requested path ${req.originalUrl} does not exist`,
  }),
);

// --- Global Error Handler ---
app.use(errorHandler);

export default app;
