import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Lower sample rate for server to save quota
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.05 : 1.0,

  // Only enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Environment
  environment: process.env.NODE_ENV,

  // Don't send in development
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development") {
      console.error("Sentry Server Event (dev):", event);
      return null;
    }
    return event;
  },
});