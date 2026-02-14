import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  updateProfileValidation,
  changePasswordValidation,
} from "../validations/user.js";
import {
  getMyProfile,
  updateMyProfile,
  changePassword,
  deleteMyAccount,
} from "../controllers/user.js";

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get("/me", getMyProfile);
router.put("/me", validate(updateProfileValidation), updateMyProfile);
router.put(
  "/me/change-password",
  validate(changePasswordValidation),
  changePassword,
);
router.delete("/me", deleteMyAccount);

export default router;
