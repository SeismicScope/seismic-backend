// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import "dotenv/config";

import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
    tracesSampleRate: 0.2,
  });
}
