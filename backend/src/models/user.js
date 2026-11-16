import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    role: { type: String, enum: ["user", "admin"], default: "user", required: true },
    email: { type: String, default: null, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    phoneNumber: { type: String, default: null },
    displayName: { type: String, default: null, trim: true },
    photoURL: { type: String, default: null },
    authProvider: { type: String, default: null },
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
