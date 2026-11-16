const apiKey = import.meta.env.VITE_FIREBASE_WEB_API_KEY;
const apiUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const sessionKey = "wayfarer-auth-session";

async function firebaseRequest(endpoint, body, { hideEmailNotFound = false } = {}) {
  if (!apiKey) {
    throw new Error("Firebase is not configured. Add VITE_FIREBASE_WEB_API_KEY to frontend/.env.");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const result = await response.json();
  const errorCode = result.error?.message;
  if (!response.ok && !(hideEmailNotFound && errorCode === "EMAIL_NOT_FOUND")) {
    throw new Error(firebaseErrorMessage(errorCode));
  }
  return result;
}

function firebaseErrorMessage(code) {
  const messages = {
    EMAIL_EXISTS: "An account with this email already exists. Try signing in instead.",
    EMAIL_NOT_FOUND: "No account was found for that email. Check it or create an account.",
    INVALID_EMAIL: "Enter a valid email address.",
    MISSING_EMAIL: "Enter your email address.",
    INVALID_LOGIN_CREDENTIALS: "That email and password combination was not recognised.",
    INVALID_PASSWORD: "That password is incorrect.",
    MISSING_PASSWORD: "Enter your password to continue.",
    WEAK_PASSWORD: "Choose a stronger password with at least 6 characters.",
    USER_DISABLED: "This account has been disabled.",
    TOO_MANY_ATTEMPTS_TRY_LATER: "Too many attempts. Please wait a moment and try again.",
    OPERATION_NOT_ALLOWED: "Email and password sign-in is not enabled for this Firebase project.",
  };
  return messages[code] || `Firebase could not complete this request (${code || "unknown error"}).`;
}

export async function sendPasswordResetEmail(email) {
  await firebaseRequest(
    "accounts:sendOobCode",
    { requestType: "PASSWORD_RESET", email },
    { hideEmailNotFound: true },
  );
}

async function syncWithBackend(idToken) {
  let response;
  try {
    response = await fetch(`${apiUrl}/api/users/sync`, {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}`, "Content-Type": "application/json" },
      body: "{}",
    });
  } catch {
    throw new Error("Could not reach the backend. Make sure it is running, then try again.");
  }
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Your account signed in, but the backend could not sync it.");
  return result.user;
}

export async function getAdminDashboard(idToken) {
  let response;
  try {
    response = await fetch(`${apiUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${idToken}` },
    });
  } catch {
    throw new Error("Could not reach the backend. Make sure it is running, then try again.");
  }

  const result = await response.json().catch(() => ({}));
  if (response.status === 403) {
    throw new Error("This account is not an admin. Sign in with your admin account.");
  }
  if (!response.ok) {
    throw new Error(result.error || "Could not verify admin access.");
  }
  return result;
}

export async function sendVerificationEmail(idToken) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "VERIFY_EMAIL", idToken }),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(firebaseErrorMessage(result.error?.message));
  }
}

function saveSession(authResult) {
  const session = {
    idToken: authResult.idToken,
    refreshToken: authResult.refreshToken,
    expiresAt: Date.now() + Number(authResult.expiresIn || 3600) * 1000 - 60_000,
    email: authResult.email,
    displayName: authResult.displayName || "",
    localId: authResult.localId,
  };
  sessionStorage.setItem(sessionKey, JSON.stringify(session));
  return session;
}

function readSession() {
  try { return JSON.parse(sessionStorage.getItem(sessionKey)); }
  catch { return null; }
}

async function refreshSession(session) {
  if (!session?.refreshToken) return null;
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: session.refreshToken }),
    },
  );
  const result = await response.json();
  if (!response.ok) return null;
  return saveSession({
    idToken: result.id_token,
    refreshToken: result.refresh_token,
    expiresIn: result.expires_in,
    email: session.email,
    displayName: session.displayName,
    localId: session.localId,
  });
}

async function getCurrentSession() {
  let session = readSession();
  if (!session) return null;
  if (!session.idToken || !session.refreshToken || !session.expiresAt) {
    signOut();
    return null;
  }
  if (Date.now() >= session.expiresAt) {
    session = await refreshSession(session);
    if (!session) signOut();
  }
  return session;
}

export async function register({ displayName, email, password }) {
  let authResult = await firebaseRequest("accounts:signUp", { email, password, returnSecureToken: true });
  authResult = await firebaseRequest("accounts:update", {
    idToken: authResult.idToken,
    displayName,
    returnSecureToken: true,
  });
  authResult.displayName = displayName;
  const session = saveSession(authResult);
  const user = await syncWithBackend(session.idToken);
  return { session, user };
}

export async function signIn({ email, password }) {
  const authResult = await firebaseRequest("accounts:signInWithPassword", { email, password, returnSecureToken: true });
  const session = saveSession(authResult);
  const user = await syncWithBackend(session.idToken);
  return { session, user };
}

export async function restoreSession() {
  const session = await getCurrentSession();
  if (!session) return null;
  const user = await syncWithBackend(session.idToken);
  return { session, user };
}

export function signOut() {
  sessionStorage.removeItem(sessionKey);
}