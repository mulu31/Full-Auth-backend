import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { hashPassword, comparePassword } from "../services/password.js";
import {
  generateAccessToken,
  generateRefreshToken,
  generateToken,
  hashToken,
} from "../services/token.js";
import { sendEmail } from "../services/email.js";
import { templates } from "../services/emailTemplates.js";
import { handleOAuthExchange } from "../services/oauthService.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

// --- Register ---
export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  // Check for existing user (including soft-deleted ones)
  const existingUser = await User.findOne({ email }).select("+deletedAt");
  
  if (existingUser) {
    if (existingUser.deletedAt) {
      // User was soft-deleted, restore the account
      existingUser.fullName = fullName;
      existingUser.password = await hashPassword(password);
      existingUser.deletedAt = null;
      existingUser.isActive = true;
      existingUser.isEmailVerified = false;
      existingUser.loginAttempts = 0;
      existingUser.lockUntil = null;
      
      const emailVerificationToken = generateToken();
      const hashedEmailToken = hashToken(emailVerificationToken);
      existingUser.emailVerificationToken = hashedEmailToken;
      existingUser.emailVerificationTokenExpiresAt = Date.now() + 3600 * 1000;
      
      await existingUser.save();
      
      const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}&email=${email}`;
      await sendEmail({
        to: email,
        subject: "Verify Email - Account Restored",
        html: templates.verifyEmail({ name: fullName, verificationLink }),
      });
      
      res.status(201).json({
        success: true,
        message: "Account restored successfully. Check your email to verify.",
      });
      return;
    }
    
    // Active user already exists
    throw new ApiError(400, "Email already registered. Please login instead.");
  }

  // Create new user
  const hashedPassword = await hashPassword(password);
  const emailVerificationToken = generateToken();
  const hashedEmailToken = hashToken(emailVerificationToken);

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    emailVerificationToken: hashedEmailToken,
    emailVerificationTokenExpiresAt: Date.now() + 3600 * 1000, // 1 hour
  });

  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${emailVerificationToken}&email=${email}`;
  await sendEmail({
    to: email,
    subject: "Verify Email",
    html: templates.verifyEmail({ name: fullName, verificationLink }),
  });

  res.status(201).json({
    success: true,
    message: "Registration successful. Check your email to verify.",
  });
});

// --- Login ---
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !user.password) throw new ApiError(401, "Invalid credentials");
  if (user.lockUntil && user.lockUntil > Date.now())
    throw new ApiError(403, "Account temporarily locked");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    user.loginAttempts += 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      await Activity.create({
        userId: user._id,
        action: "ACCOUNT_BLOCKED",
        ipAddress: req.ip,
        device: req.headers["user-agent"],
      });
    }
    await user.save();
    throw new ApiError(401, "Invalid credentials");
  }

  // Reset login attempts
  user.loginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = Date.now();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(refreshToken);

  user.refreshTokens.push({
    tokenHash: hashedRefreshToken,
    device: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000, // 7 days
  });

  await user.save();
  await Activity.create({
    userId: user._id,
    action: "LOGIN_SUCCESS",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
  });

  res.json({ success: true, accessToken, refreshToken });
});

// --- Logout ---
export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token required");

  const hashed = hashToken(refreshToken);
  req.user.refreshTokens = req.user.refreshTokens.filter(
    (rt) => rt.tokenHash !== hashed,
  );
  await req.user.save();

  await Activity.create({
    userId: req.user._id,
    action: "LOGOUT",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
  });

  res.json({ success: true, message: "Logged out successfully" });
});

// --- Refresh Token ---
export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(400, "Refresh token required");
  const hashed = hashToken(refreshToken);
  const user = await User.findOne({ "refreshTokens.tokenHash": hashed });
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const tokenIndex = user.refreshTokens.findIndex((rt) => rt.tokenHash === hashed);
  const tokenEntry = tokenIndex !== -1 ? user.refreshTokens[tokenIndex] : null;
  if (!tokenEntry || Date.now() > tokenEntry.expiresAt)
    throw new ApiError(401, "Refresh token expired");

  // Rotate refresh token: issue a new refresh token and replace the stored hash
  const newRefreshToken = generateRefreshToken();
  const newHashed = hashToken(newRefreshToken);

  // Preserve device/ip info but replace tokenHash and expiry
  user.refreshTokens[tokenIndex].tokenHash = newHashed;
  user.refreshTokens[tokenIndex].issuedAt = Date.now();
  user.refreshTokens[tokenIndex].expiresAt = Date.now() + 7 * 24 * 3600 * 1000; // 7 days

  await user.save();

  const accessToken = generateAccessToken(user._id);
  res.json({ success: true, accessToken, refreshToken: newRefreshToken });
});

// --- Forgot Password ---
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const token = generateToken();
  user.passwordResetToken = hashToken(token);
  user.passwordResetTokenExpiresAt = Date.now() + 3600 * 1000; // 1 hour
  await user.save();

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;
  await sendEmail({
    to: email,
    subject: "Reset Password",
    html: templates.resetPassword({ name: user.fullName, resetLink }),
  });

  res.json({ success: true, message: "Password reset email sent" });
});

// --- Reset Password ---
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired token");

  user.password = await hashPassword(password);
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresAt = undefined;
  await user.save();

  await Activity.create({
    userId: user._id,
    action: "PASSWORD_RESET",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
  });

  res.json({ success: true, message: "Password reset successfully" });
});

// --- Verify Email ---
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token, email } = req.query;
  if (!token || !email) throw new ApiError(400, "Token and email required");

  const hashed = hashToken(token);
  const user = await User.findOne({
    email,
    emailVerificationToken: hashed,
    emailVerificationTokenExpiresAt: { $gt: Date.now() },
  });

  if (!user) throw new ApiError(400, "Invalid or expired token");

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiresAt = undefined;
  await user.save();

  await Activity.create({
    userId: user._id,
    action: "EMAIL_VERIFIED",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
  });

  res.json({ success: true, message: "Email verified successfully" });
});

// --- OAuth Login ---
export const oauthLogin = asyncHandler(async (req, res) => {
  const { provider, code } = req.body;
  
  if (!provider || !code) {
    throw new ApiError(400, "Missing provider or authorization code");
  }

  // Exchange code for user info via OAuth provider
  const oauthUser = await handleOAuthExchange(provider, code);
  
  const { providerId, email, fullName, picture } = oauthUser;

  // Find or create user
  let user = await User.findOne({ email });

  if (!user) {
    // Create new user
    user = await User.create({
      email,
      fullName,
      oauthProviders: [{ provider, providerId }],
      isEmailVerified: true, // OAuth emails are pre-verified
    });
    
    await Activity.create({
      userId: user._id,
      action: "USER_CREATED",
      ipAddress: req.ip,
      device: req.headers["user-agent"],
      metadata: { provider, method: 'oauth' },
    });
  } else {
    // Check if this OAuth provider is already linked
    const providerExists = user.oauthProviders.some(
      (p) => p.provider === provider && p.providerId === providerId
    );
    
    if (!providerExists) {
      user.oauthProviders.push({ provider, providerId });
    }
    
    // Update last login
    user.lastLoginAt = Date.now();
    await user.save();
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken();
  const hashedRefreshToken = hashToken(refreshToken);

  user.refreshTokens.push({
    tokenHash: hashedRefreshToken,
    device: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000, // 7 days
  });

  await user.save();

  await Activity.create({
    userId: user._id,
    action: "LOGIN_SUCCESS",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
    metadata: { provider, method: 'oauth' },
  });

  // Return user data without password
  const userData = {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    isActive: user.isActive,
    bio: user.bio,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };

  res.json({ success: true, accessToken, refreshToken, user: userData });
});
