import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const serviceAccountPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../serviceAccountKey.json",
);
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

const firebaseApp = getApps()[0] ?? initializeApp({ credential: cert(serviceAccount) });

export const firebaseAuth = getAuth(firebaseApp);
