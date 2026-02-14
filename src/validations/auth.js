import Joi from "joi";

// Register
export const registerValidation = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

// Login
export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Forgot Password
export const forgotPasswordValidation = Joi.object({
  email: Joi.string().email().required(),
});

// Reset Password
export const resetPasswordValidation = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128).required(),
});
