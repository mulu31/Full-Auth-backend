import express from "express";
import { validate } from "../middlewares/validate.js";
import { authRateLimiter } from "../middlewares/rateLimit.js";
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../validations/auth.js";

import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  oauthLogin,
} from "../controllers/auth.js";

import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Public routes with validation & rate limiting
router.post(
  "/register",
  authRateLimiter,
  validate(registerValidation),
  registerUser,
);
router.post("/login", authRateLimiter, validate(loginValidation), loginUser);
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  forgotPassword,
);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword,
);
router.post("/oauth", oauthLogin);
router.get("/verify-email/", verifyEmail);

// Protected route
router.post("/logout", authenticate, logoutUser);
router.post("/refresh", refreshToken);

export default router;
