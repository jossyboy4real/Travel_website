import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
dotenv.config({ path: resolve(backendRoot, ".env") });

export const PORT = Number(process.env.PORT || 5000);
export const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("MONGODB_URL is missing from backend/.env");
}

export const IGNAV_API_KEY = process.env.IGNAV_API_KEY;