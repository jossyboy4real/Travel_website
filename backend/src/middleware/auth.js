import { firebaseAuth } from "../config/firebase.js";

export async function requireFirebaseAuth(req, res, next) {
  const authorization = req.headers.authorization;
  const [scheme, token] = authorization?.split(" ") ?? [];

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "A Bearer token is required." });
  }

  try {
    req.user = await firebaseAuth.verifyIdToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: "The Firebase ID token is invalid or expired." });
  }
}
