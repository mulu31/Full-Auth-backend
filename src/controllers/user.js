import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { hashPassword, comparePassword } from "../services/password.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

// --- Get My Profile ---
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({ success: true, data: user });
});

// --- Update My Profile ---
export const updateMyProfile = asyncHandler(async (req, res) => {
  const { fullName, bio } = req.body;

  // Fetch fresh user data to ensure we have the latest
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (fullName !== undefined) user.fullName = fullName;
  if (bio !== undefined) user.bio = bio;

  await user.save();

  await Activity.create({
    userId: user._id,
    action: "USER_UPDATED",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
    metadata: { updatedFields: req.body },
  });

  // Return user without password
  const updatedUser = await User.findById(user._id).select("-password");

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});

// --- Change Password ---
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Fetch user with password (auth middleware excludes it)
  const user = await User.findById(req.user._id).select("+password");
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if user has a password (OAuth users might not have one)
  if (!user.password) {
    throw new ApiError(
      400,
      "Cannot change password. This account uses OAuth authentication."
    );
  }

  // Verify old password
  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  // Check if new password is same as old
  const isSameAsOld = await comparePassword(newPassword, user.password);
  if (isSameAsOld) {
    throw new ApiError(400, "New password must be different from current password");
  }

  // Hash and save new password
  user.password = await hashPassword(newPassword);
  await user.save();

  // Log activity
  await Activity.create({
    userId: user._id,
    action: "PASSWORD_CHANGE",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
  });

  res.json({ success: true, message: "Password changed successfully" });
});

// --- Delete My Account (Soft Delete) ---
export const deleteMyAccount = asyncHandler(async (req, res) => {
  // Fetch fresh user data
  const user = await User.findById(req.user._id);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.deletedAt = new Date();
  user.isActive = false;
  await user.save();

  await Activity.create({
    userId: user._id,
    action: "USER_DELETED",
    ipAddress: req.ip,
    device: req.headers["user-agent"],
  });

  res.json({ success: true, message: "Account deleted successfully" });
});
