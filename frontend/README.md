# Frontend authentication

This is a small React/Vite client for the existing Firebase Admin + Express backend. It intentionally stops after account registration, login, logout, and syncing the signed-in profile; bookings and the rest of the travel dashboard are left for you to build.

## First-time setup

1. In the Firebase Console, open **Authentication → Sign-in method** and enable **Email/Password**.
2. Copy `.env.example` to `.env`. Set `VITE_FIREBASE_WEB_API_KEY` to the Firebase **Web API key** already configured as `FIREBASE_WEB_API_KEY` in `backend/.env`. Keep the `VITE_API_URL` value for local development.
3. Install the frontend packages from the project root with `npm install --prefix frontend`.
4. In one terminal, start the backend with `npm run dev`. In another, start the UI with `npm run client:dev`.
5. Open the local URL Vite prints, create an account, then sign out and test signing in again.

The backend also needs its existing `backend/.env`, Firebase Admin service-account configuration, and a reachable MongoDB database. Never commit `.env` files or the service-account JSON.

## What the flow does

- Registration creates a Firebase email/password account and sets its display name. The regular sign-in screen also lets users request a password reset email through Firebase.
- Login and registration both send the Firebase ID token as `Authorization: Bearer …` to `POST /api/users/sync`.
- The existing Express middleware verifies that token; the existing controller creates or updates the MongoDB user document.
- The browser keeps the Firebase ID and refresh tokens in `sessionStorage` for this tab, refreshes an expired ID token, and clears the local session on sign-out.
- Regular account registration/sign-in is at `/login`; the separate, sign-in-only admin entry is `/admin/login`. Both authenticate with Firebase, but the admin entry calls the protected `GET /api/admin/dashboard` endpoint before showing the admin landing screen. A regular user is rejected by the backend and cannot gain access by visiting that URL.
- If an account's email is not verified, the signed-in regular account screen provides **Send verification email**. After following the email link, sign out and sign back in so the backend syncs Firebase's current `email_verified` status.

For local testing, open `http://localhost:5173/login` for normal registration/sign-in or `http://localhost:5173/admin/login` for admin sign-in. The regular login page also has an **Admin sign in** link. Only the private backend setup process can grant the admin role; there is no admin registration form.

Useful places to learn/change the flow: `src/App.jsx` (forms and signed-in screen), `src/firebaseAuth.js` (Firebase requests and API sync), and `src/style.css` (visual design).
