/**
 * Public base URL of the deployment, used to build absolute links in
 * emails and Discord notifications.
 *
 * Reads NEXT_PUBLIC_APP_URL and falls back to the production deployment,
 * so links never point at a hard-coded custom domain. A value without a
 * scheme (e.g. "beaverworld-dev.vercel.app") is treated as https.
 */
const PRODUCTION_URL = "https://beaverworld-dev.vercel.app";

function normalizeBaseUrl(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export const APP_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL || PRODUCTION_URL);
