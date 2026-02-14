import Joi from "joi";

// Create User
export const createUserValidation = Joi.object({
  fullName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid("user", "admin").default("user"),
});

// Update User
export const updateUserValidation = Joi.object({
  fullName: Joi.string().min(3).max(50),
  bio: Joi.string().max(250).allow("", null),
  role: Joi.string().valid("user", "admin"),
  isActive: Joi.boolean(),
});
