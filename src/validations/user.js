import Joi from "joi";

// Update profile
export const updateProfileValidation = Joi.object({
  fullName: Joi.string().min(3).max(50),
  bio: Joi.string().max(250).allow("", null),
});

// Change password
export const changePasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});
