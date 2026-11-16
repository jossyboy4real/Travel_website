import { User } from "../models/user.js";

export async function syncCurrentUser(req, res, next) {
  try {
    const claims = req.user;
    const user = await User.findOneAndUpdate(
      { firebaseUid: claims.uid },
      {
        $set: {
          email: claims.email ?? null,
          emailVerified: claims.email_verified === true,
          phoneNumber: claims.phone_number ?? null,
          displayName: claims.name ?? null,
          photoURL: claims.picture ?? null,
          authProvider: claims.firebase?.sign_in_provider ?? null,
        },
        $setOnInsert: { firebaseUid: claims.uid, role: "user" },
      },
      { returnDocument: "after", upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );

    return res.status(200).json({ user });
  } catch (error) {
    return next(error);
  }
}
