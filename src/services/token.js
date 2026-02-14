import crypto from "crypto";
import jwt from "jsonwebtoken";

// JWT Access Token
export const generateAccessToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

// Random Refresh Token
export const generateRefreshToken = () => crypto.randomBytes(64).toString("hex");

// Random Token (for email verification or password reset)
export const generateToken = () => crypto.randomBytes(32).toString("hex");

// SHA-256 hash
export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");
