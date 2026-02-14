import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const RefreshTokenSchema = new mongoose.Schema({
  tokenHash: {
    type: String,
    required: true,
  },
  device: String,
  ipAddress: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL index for auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OAuthProviderSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ["google", "github", "facebook"],
    required: true,
  },
  providerId: { type: String, required: true },
});


const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
    }, // required logic handled in controller for standard users
    bio: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    oauthProviders: [OAuthProviderSchema],
    passwordResetToken: String,
    passwordResetTokenExpiresAt: Date,
    emailVerificationToken: String,
    emailVerificationTokenExpiresAt: Date,
    refreshTokens: [RefreshTokenSchema],
    lastLoginAt: Date,
    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,
    deletedAt: Date,
  },
  { timestamps: true },
);

// Compound unique index: email is unique only for non-deleted users
UserSchema.index(
  { email: 1, deletedAt: 1 },
  { 
    unique: true,
    partialFilterExpression: { deletedAt: null }
  }
);

// Auto exclude soft-deleted users
UserSchema.pre(/^find/, function () {
  this.where({ deletedAt: null });
});

// Password comparison
UserSchema.methods.comparePassword = async function (plainPassword) {
  const peppered = plainPassword + process.env.PASSWORD_PEPPER;
  return bcrypt.compare(peppered, this.password);
};

// Account lockout helper
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

export default mongoose.model("User", UserSchema);
