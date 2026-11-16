import mongoose from "mongoose";
import { MONGODB_URL } from "../src/config/env.js";
import { firebaseAuth } from "../src/config/firebase.js";
import { User } from "../src/models/user.js";

const firebaseUid = process.env.ADMIN_FIREBASE_UID?.trim();
const confirmedFirebaseUid = process.env.ADMIN_FIREBASE_UID_CONFIRM?.trim();
let currentStep = "starting admin promotion";

if (!firebaseUid || !confirmedFirebaseUid) {
  console.error("Set ADMIN_FIREBASE_UID and ADMIN_FIREBASE_UID_CONFIRM before running this script.");
  process.exit(1);
}
if (firebaseUid !== confirmedFirebaseUid) {
  console.error("The configured Firebase UID and confirmation UID must match.");
  process.exit(1);
}

try {
  currentStep = "checking the Firebase account";
  const firebaseUser = await firebaseAuth.getUser(firebaseUid);
  if (firebaseUser.uid !== firebaseUid) {
    throw new Error("SAFE: Firebase returned a different UID. Recheck the UID copied from Firebase Console.");
  }
  if (!firebaseUser.emailVerified) {
    throw new Error("SAFE: The Firebase account email is not verified. Verify it, then run the script again.");
  }

  currentStep = "connecting to MongoDB";
  await mongoose.connect(MONGODB_URL);

  currentStep = "checking that the Firebase account has synced to MongoDB";
  const existingUser = await User.findOne({ firebaseUid }).select("firebaseUid").lean();
  if (!existingUser) {
    throw new Error("SAFE: This account has not synced to MongoDB yet. Sign in once through the app, then retry.");
  }

  currentStep = "checking whether another admin already exists";
  const otherAdmin = await User.findOne({ role: "admin", firebaseUid: { $ne: firebaseUid } })
    .select("firebaseUid")
    .lean();
  if (otherAdmin) {
    throw new Error("SAFE: A different admin already exists. This setup allows one admin and will not add another.");
  }

  currentStep = "updating the MongoDB user role";
  const result = await User.updateOne(
    { firebaseUid },
    { $set: { role: "admin" } },
    { runValidators: true },
  );
  if (result.matchedCount !== 1) {
    throw new Error("SAFE: No matching MongoDB account was updated. Sign in once through the app, then retry.");
  }

  console.log("The configured, email-verified Firebase account was promoted to admin.");
} catch (error) {
  if (error.message.startsWith("SAFE: ")) {
    console.error(`Admin promotion failed. ${error.message.slice(6)}`);
  } else {
    console.error(`Admin promotion failed while ${currentStep}. Check the UID, Firebase Admin service-account setup, and backend database configuration. Sensitive error details were not printed.`);
  }
  process.exitCode = 1;
} finally {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}