import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { EMAIL_CONTACT, FORM_KINDS, MAX_BODY_BYTES, type FormKind } from "../../shared/forms.js";
import {
  checkToken,
  issueToken,
  overDailyCap,
  countSend,
  pruneRateLimits,
  rateLimited,
  sentTodayCount,
} from "./guard.js";
import { initMail, isDryRun, sendSubmission } from "./mail.js";
import { validate } from "./validate.js";

/**
 * Deliberately not `PORT`: hosting platforms inject that to tell an app which
 * port to serve on, and Coolify sets it to the container's exposed port. This
 * process is behind nginx on loopback, so inheriting that would make it fight
 * nginx for :80 and die with EADDRINUSE on every restart. nginx proxies to
 * 8080, so the two have to agree; change both or neither.
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

function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

/** nginx passes the Cloudflare client IP through; fall back to the socket. */
function clientIp(req: IncomingMessage): string {
  const header = req.headers["x-real-ip"];
  const value = Array.isArray(header) ? header[0] : header;
  return (value || req.socket.remoteAddress || "unknown").trim();
}

/** Reads at most MAX_BODY_BYTES, hanging up rather than buffering more. */
function readBody(req: IncomingMessage): Promise<string | null> {
  return new Promise((resolve) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        resolve(null);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", () => resolve(null));
  });
}

function isFormKind(v: string): v is FormKind {
  return (FORM_KINDS as readonly string[]).includes(v);
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const path = url.pathname.replace(/\/+$/, "") || "/";

  if (path === "/api/health") {
    return json(res, 200, {
      ok: true,
      dryRun: isDryRun(),
      mailConfigured: !MAIL_MISCONFIGURED,
      sentToday: sentTodayCount(),
    });
  }

  const ip = clientIp(req);

  if (path === "/api/forms/token") {
    if (req.method !== "GET") return json(res, 405, { ok: false });
    if (rateLimited(ip)) return json(res, 429, { ok: false, error: "Too many requests." });
    return json(res, 200, issueToken());
  }

  const match = /^\/api\/forms\/([a-z]+)$/.exec(path);
  if (!match) return json(res, 404, { ok: false });

  const kind = match[1];
  if (!isFormKind(kind)) return json(res, 404, { ok: false });
  if (req.method !== "POST") return json(res, 405, { ok: false });

  // Cheap checks first, so noise never reaches the parser or the mailer.
  if (rateLimited(ip)) return json(res, 429, { ok: false, error: "Too many requests." });

  const origin = req.headers.origin;
  if (origin !== undefined && origin !== ALLOWED_ORIGIN) {
    return json(res, 403, { ok: false, error: "Bad origin." });
  }

  // A cross-site HTML form cannot send this content type without a preflight,
  // which this server never approves. That is most of CSRF handled.
  const contentType = (req.headers["content-type"] ?? "").split(";")[0].trim();
  if (contentType !== "application/json") {
    return json(res, 415, { ok: false, error: "Expected application/json." });
  }

  const raw = await readBody(req);
  if (raw === null) return json(res, 413, { ok: false, error: "Too large." });

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json(res, 400, { ok: false, error: "Malformed request." });
  }

  const tokenError = checkToken((body as { token?: unknown } | null)?.token);
  if (tokenError !== null) {
    return json(res, 400, { ok: false, error: "Please reload the page and try again." });
  }

  const result = validate(kind, body);
  if (!result.ok) {
    // A tripped honeypot gets the success it expects, and nothing else.
    if (result.reason === "honeypot") return json(res, 200, { ok: true });
    return json(res, 400, { ok: false, error: result.reason });
  }

  if (MAIL_MISCONFIGURED) {
    console.error(`mail is not configured; refusing ${kind} submission`);
    return json(res, 503, {
      ok: false,
      error: `We could not send that. Please email ${EMAIL_CONTACT}.`,
    });
  }

  if (overDailyCap()) {
    console.error(`daily send cap reached; dropping ${kind} submission`);
    return json(res, 503, { ok: false, error: "Temporarily unavailable." });
  }

  try {
    await sendSubmission(kind, result.value);
    countSend();
  } catch (err) {
    // Never log the submission itself, only that it failed.
    console.error(`send failed for ${kind}:`, err instanceof Error ? err.message : err);
    return json(res, 502, { ok: false, error: "We could not send that just now." });
  }

  return json(res, 200, { ok: true });
}

const server = createServer((req, res) => {
  handle(req, res).catch((err) => {
    console.error("unhandled:", err instanceof Error ? err.message : err);
    if (!res.headersSent) json(res, 500, { ok: false });
  });
});

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
  console.log(`forms api on 127.0.0.1:${PORT}${isDryRun() ? " (dry run)" : ""}`);
});

for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
