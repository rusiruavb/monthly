import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
  [key: string]: unknown;
};

export function loadServiceAccountCredentials(): ServiceAccountCredentials {
  const path = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
  if (path) {
    const absolute = resolve(process.cwd(), path);
    const raw = readFileSync(absolute, "utf8");
    return JSON.parse(raw) as ServiceAccountCredentials;
  }

  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!json) {
    throw new Error(
      "Set GOOGLE_SERVICE_ACCOUNT_PATH (recommended) or GOOGLE_SERVICE_ACCOUNT_JSON in .env",
    );
  }

  const trimmed = json.trim();
  if (trimmed === "{" || trimmed.length < 10) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON was truncated by .env parsing. " +
        "Use GOOGLE_SERVICE_ACCOUNT_PATH=./secrets/google-service-account.json instead " +
        "(see .env.example).",
    );
  }

  try {
    return JSON.parse(trimmed) as ServiceAccountCredentials;
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_JSON is invalid JSON. " +
        "Prefer GOOGLE_SERVICE_ACCOUNT_PATH pointing at your downloaded key file.",
    );
  }
}
