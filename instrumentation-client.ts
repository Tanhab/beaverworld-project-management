// instrumentation-client.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Use environment variable instead of hardcoded DSN
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Reduce sample rate in production to stay within free tier
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Environment
  environment: process.env.NODE_ENV,

  // Only enable debug in development
  debug: process.env.NODE_ENV === "development",

  // Session Replay - optimized for free tier
  replaysSessionSampleRate: 0.05, // Only 5% of sessions (was 0.1)
  replaysOnErrorSampleRate: 1.0,   // 100% when error occurs

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,        // Privacy: mask all text
      blockAllMedia: true,      // Privacy: block images/videos
      maskAllInputs: true,      // Privacy: mask form inputs
    }),
  ],

  // Enable sending user PII (keep this, it helps debugging)
  sendDefaultPii: true,

  // Filter out common non-issues
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    // Random network errors
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // ResizeObserver (common, not critical)
    'ResizeObserver loop limit exceeded',
    // Random user navigation
    'cancelled',
    'canceled',
  ],

  // Don't send events in development
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === "development") {
      console.log("Sentry Event (dev - not sent):", event);
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;