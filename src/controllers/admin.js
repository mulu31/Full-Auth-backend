import User from "../models/User.js";
import Activity from "../models/Activity.js";
import { hashPassword } from "../services/password.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

// --- Get All Users ---
export const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  // Build search query
  const query = {};
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// --- Get User By ID ---
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});

// --- Create User ---
export const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(400, "Email already exists");

  const hashedPassword = password ? await hashPassword(password) : undefined;

  const user = await User.create({
    fullName,
    email,
    password: hashedPassword,
    role,
  });

  await Activity.create({
    userId: req.user._id,
    action: "USER_CREATED",
    metadata: { createdUserId: user._id },
  });

  res
    .status(201)
    .json({ success: true, message: "User created successfully", data: user });
});

// --- Update User ---
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const { fullName, email, role, password } = req.body;

  if (fullName !== undefined) user.fullName = fullName;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (password) user.password = await hashPassword(password);

  await user.save();

  await Activity.create({
    userId: req.user._id,
    action: "USER_UPDATED",
    metadata: { updatedUserId: user._id, updatedFields: req.body },
  });

  res.json({ success: true, message: "User updated successfully", data: user });
});

// --- Delete User (Soft Delete) ---
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.isActive = false;
  user.deletedAt = new Date();
  await user.save();

  await Activity.create({
    userId: req.user._id,
    action: "USER_DELETED",
    metadata: { deletedUserId: user._id },
  });

  res.json({ success: true, message: "User deleted successfully" });
});

// --- Block User ---
export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.isActive = false;
  await user.save();

  await Activity.create({
    userId: req.user._id,
    action: "ACCOUNT_BLOCKED",
    metadata: { blockedUserId: user._id },
  });

  res.json({ success: true, message: "User blocked successfully" });
});

// --- Unblock User ---
export const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.isActive = true;
  user.lockUntil = null;
  user.loginAttempts = 0;
  await user.save();

  await Activity.create({
    userId: req.user._id,
    action: "ACCOUNT_UNBLOCKED",
    metadata: { unblockedUserId: user._id },
  });

  res.json({ success: true, message: "User unblocked successfully" });
});

// --- Get Activity Logs ---
export const getActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const skip = (page - 1) * limit;

  const logs = await Activity.find()
    .populate("userId", "fullName email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Activity.countDocuments();

  res.json({
    success: true,
    data: logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});
