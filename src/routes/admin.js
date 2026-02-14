import express from "express";
import { authenticate } from "../middlewares/auth.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import {
  createUserValidation,
  updateUserValidation,
} from "../validations/admin.js";

import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
  getActivityLogs,
} from "../controllers/admin.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize("admin"));

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", validate(createUserValidation), createUser);
router.put("/users/:id", validate(updateUserValidation), updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/block", blockUser);
router.put("/users/:id/unblock", unblockUser);
router.get("/activity-logs", getActivityLogs);

export default router;
