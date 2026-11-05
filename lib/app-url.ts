/**
 * Public base URL of the deployment, used to build absolute links in
 * emails and Discord notifications.
 *
 * Reads NEXT_PUBLIC_APP_URL and falls back to the production deployment,
 * so links never point at a hard-coded custom domain.
 */
const PRODUCTION_URL = "https://beaverworld-dev.vercel.app";

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || PRODUCTION_URL).replace(/\/+$/, "");
