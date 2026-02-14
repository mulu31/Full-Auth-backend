import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "LOGOUT",
        "PASSWORD_CHANGE",
        "PASSWORD_RESET",
        "EMAIL_VERIFIED",
        "ACCOUNT_BLOCKED",
        "ACCOUNT_UNBLOCKED",
        "USER_CREATED",
        "USER_UPDATED",
        "USER_DELETED",
      ],
      index: true,
    },
    ipAddress: String,
    device: String,
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true },
);

export default mongoose.model("Activity", ActivitySchema);
