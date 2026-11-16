import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const projectRoot = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(projectRoot, "backend/.env") });

const apiKey = process.env.FIREBASE_WEB_API_KEY;
if (!apiKey) {
  console.error("FIREBASE_WEB_API_KEY is missing from backend/.env");
  process.exit(1);
}

const terminal = createInterface({ input: stdin, output: stdout });

try {
  const email = (await terminal.question("Test account email: ")).trim();
  const password = await terminal.question("Test account password (input will be visible): ");

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  const result = await response.json();

  if (!response.ok) {
    const firebaseError = result.error?.message || "Sign-in failed";
    console.error(`Firebase sign-in failed: ${firebaseError}`);
    process.exitCode = 1;
  } else {
    console.log(`Signed in successfully. Firebase UID: ${result.localId}`);
    console.log("ID token (keep private; use it only in your local API request):");
    console.log(result.idToken);
  }
} catch (error) {
  console.error(`Could not complete Firebase sign-in: ${error.message}`);
  process.exitCode = 1;
} finally {
  terminal.close();
}
