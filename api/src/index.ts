import { createServer } from "node:http";
import { createListener } from "./app.js";
import { pruneRateLimits } from "./guard.js";
import { initMail, isDryRun, sendConfirmation, sendSubmission } from "./mail.js";

/**
 * Deliberately not `PORT`: hosting platforms inject that to tell an app which
 * port to serve on, and it names the container's public port. This process is
 * behind nginx on loopback, so inheriting that would make it fight nginx for
 * :80 and die with EADDRINUSE on every restart. nginx proxies to 8080, so the
 * two have to agree; change both or neither.
 */
const PORT = Number(process.env.FORMS_API_PORT ?? 8080);
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://kerniva.app";

/**
 * A missing SMTP config in production must not drop submissions silently, but
 * it must not take the site down either: this process shares a container with
 * the nginx that serves the marketing pages. So it starts, says so loudly, and
 * refuses submissions with an error the visitor can act on. In development the
 * dry run just logs what it would have sent.
 */
const MAIL_MISCONFIGURED = isDryRun() && process.env.NODE_ENV === "production";
if (MAIL_MISCONFIGURED) {
  console.error(
    "SMTP_HOST is not set: the site still serves, but form submissions will be " +
      "refused until the SMTP_* variables are provided.",
  );
}
initMail();

/** Off unless asked for: the acknowledgement writes to an unverified address. */
const CONFIRMATIONS = ["1", "true"].includes(
  (process.env.CONFIRMATION_ENABLED ?? "").trim().toLowerCase(),
);

const server = createServer(
  createListener({
    allowedOrigin: ALLOWED_ORIGIN,
    dryRun: isDryRun(),
    mailMisconfigured: MAIL_MISCONFIGURED,
    confirmations: CONFIRMATIONS,
    sendSubmission,
    sendConfirmation,
  }),
);

const prune = setInterval(() => pruneRateLimits(), 600_000);
prune.unref();

server.on("error", (err: NodeJS.ErrnoException) => {
  // Without this the only clue is a bare stack trace in the container log.
  if (err.code === "EADDRINUSE") {
    console.error(
      `forms api cannot bind 127.0.0.1:${PORT}: already in use. ` +
        "Set FORMS_API_PORT to a free port and match it in nginx.conf.",
    );
  } else {
    console.error(`forms api failed to listen on 127.0.0.1:${PORT}:`, err.message);
  }
  process.exitCode = 1;
});

server.listen(PORT, "127.0.0.1", () => {
  const notes = [isDryRun() ? "dry run" : "", CONFIRMATIONS ? "confirmations on" : ""].filter(
    Boolean,
  );
  console.log(`forms api on 127.0.0.1:${PORT}${notes.length ? ` (${notes.join(", ")})` : ""}`);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
