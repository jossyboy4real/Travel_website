# Backend admin access setup and tests

Admin authorization uses the MongoDB `User.role` value. Firebase verifies identity; the API then looks up that UID in MongoDB on every `/api/admin` request. No request-body role or Firebase client claim grants admin access.

## Promote your own development account

1. Enable Firebase Email/Password sign-in and create your account. The existence of the account/email in Firebase Authentication does not mean its email is verified: `emailVerified` must be `true`. While signed in to the regular UI, use **Send verification email** if needed, then click the link in your inbox (check spam too). Sign out and sign back in afterward so Firebase issues a token with the updated verification status.
2. Sign in once and call `POST http://localhost:5000/api/users/sync` with your Firebase ID token. This creates the MongoDB user record with the default `user` role.
3. Copy your Firebase **UID** from Firebase Console → Authentication → Users. Use the UID, not the email address.
4. Make sure the existing `backend/.env` and root `serviceAccountKey.json` are available locally. They must not be committed. In PowerShell, set the target UID just for this terminal session and run the private script:

   ```powershell
  $env:ADMIN_FIREBASE_UID = "your-own-verified-firebase-uid"
  $env:ADMIN_FIREBASE_UID_CONFIRM = "your-own-verified-firebase-uid"
   npm run admin:promote
   Remove-Item Env:ADMIN_FIREBASE_UID
  Remove-Item Env:ADMIN_FIREBASE_UID_CONFIRM
   ```

The script requires the UID twice as an explicit confirmation, uses the existing Firebase Admin service account and MongoDB configuration, checks that Firebase returns the exact configured UID and that its email is verified, and updates only the already-synced MongoDB record for that UID. It refuses to add a second admin if another admin record already exists. It does not create an account or expose credentials. If the UIDs differ, the Firebase account does not exist, the email is unverified, no synced user record exists, or a different admin already exists, it fails without promoting anyone. Run it only for the account you control.

## Get a Firebase ID token for API testing

Use Postman to make a `POST` request to `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=YOUR_FIREBASE_WEB_API_KEY` with JSON body:

```json
{
  "email": "your-test-account@example.com",
  "password": "your-test-account-password",
  "returnSecureToken": true
}
```

The response contains `idToken`. Keep it in a private Postman environment variable or paste it into the authorization field locally. Never share, log, or commit the password or token. The API key is the Firebase Web API key (not the service-account private key). Do not use the service-account JSON in Postman or the browser.

For all API tests below, set `Authorization` to `Bearer <idToken>` when a token is required. Start the server with `npm run dev`; MongoDB and Firebase Admin must be configured as they are for the existing backend.

## Authorization tests

### 1. Missing token is rejected (401)

- `GET http://localhost:5000/api/admin/dashboard`
- Remove the `Authorization` header.
- Expect HTTP `401` and a message that a Bearer token is required.

### 2. Ordinary user is forbidden (403)

- Sign in as a regular Firebase account and sync it once with `POST /api/users/sync`.
- Call `GET http://localhost:5000/api/admin/dashboard` with that account's ID token.
- Expect HTTP `403` and `Admin access is required.`

### 3. Admin is accepted (200)

- Promote the intended account using the private setup steps above.
- Sign in again to obtain a fresh ID token.
- Call `GET http://localhost:5000/api/admin/dashboard` using that token.
- Expect HTTP `200`, `Admin access granted.`, and an admin object whose role is `admin`.

### 4. A normal user cannot promote themselves

- Use an ordinary account's token to call `POST http://localhost:5000/api/users/sync` with JSON body `{ "role": "admin" }`.
- Confirm the returned user still has role `user` (and the dashboard request still returns `403`). The sync controller only copies Firebase identity/profile claims and does not write a role from the body.
- There is no public role-update or admin-registration endpoint. Do not use an already-admin account for this check.

### 5. New users default to `user`

- Create a fresh Firebase test account, then call `POST http://localhost:5000/api/users/sync` with its ID token and an empty JSON body.
- Expect HTTP `200` and `user.role` equal to `user`. The model default and sync insert default both set this role.

### 6. Promotion targets only the configured Firebase UID

- Use your own verified UID in both variables, run `npm run admin:promote`, and confirm only that account receives admin access.
- For a safe negative check, set `ADMIN_FIREBASE_UID` to your UID and `ADMIN_FIREBASE_UID_CONFIRM` to a different UID. The script must stop before contacting Firebase or MongoDB and make no change. Do not set another person's UID as an administrator.
- The script has no broad update, upsert, public HTTP endpoint, email-based lookup, or client-supplied role path.

## Existing accounts

Accounts created before the role field was added are not admins. Mongoose supplies the `user` schema default when a missing role is read, and the authorization middleware requires the database query to return the exact role `admin`; therefore a missing role is denied with HTTP `403`. No user passwords are stored in MongoDB.
