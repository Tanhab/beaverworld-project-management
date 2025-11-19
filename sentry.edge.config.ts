// sentry.edge.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Reduce sample rate in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs
  enableLogs: true,

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Enable sending user PII
  sendDefaultPii: true,

  // Don't send in development
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development") {
      console.log("Sentry Edge Event (dev - not sent):", event);
      return null;
    }
    return event;
  },
});