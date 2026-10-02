import type { IncomingMessage, ServerResponse } from "node:http";
import { EMAIL_CONTACT, FORM_KINDS, MAX_BODY_BYTES, type FormKind } from "../../shared/forms.js";
import {
  checkToken,
  claimConfirmation,
  claimToken,
  countSend,
  issueToken,
  overDailyCap,
  rateLimited,
  releaseToken,
  sentTodayCount,
  type Token,
} from "./guard.js";
import { validate, type Clean } from "./validate.js";

/**
 * What the request handler needs from the process around it. Passed in rather
 * than read from the environment so the whole request path can be exercised
 * in a test with no mail server and no fixed port.
 */
export type Deps = {
  allowedOrigin: string;
  dryRun: boolean;
  /** Production with no SMTP: serve the site, refuse submissions. */
  mailMisconfigured: boolean;
  /** Whether a delivered submission is acknowledged to the visitor. */
  confirmations: boolean;
  sendSubmission: (kind: FormKind, fields: Clean) => Promise<void>;
  sendConfirmation: (kind: FormKind, fields: Clean) => Promise<void>;
};

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

export function createHandler(deps: Deps) {
  /**
   * Fire and forget. The submission has already reached the team, which is
   * what the visitor was promised, so nothing that happens here may change
   * the response: not a refused recipient, not a slow server.
   */
  function acknowledge(kind: FormKind, fields: Clean): void {
    if (!deps.confirmations || !fields.email) return;
    if (!claimConfirmation(fields.email)) return;
    deps.sendConfirmation(kind, fields).catch((err: unknown) => {
      // Never log the address, only that it failed.
      console.error(`confirmation failed for ${kind}:`, err instanceof Error ? err.message : err);
    });
  }

  return async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", "http://localhost");
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/api/health") {
      return json(res, 200, {
        ok: true,
        dryRun: deps.dryRun,
        mailConfigured: !deps.mailMisconfigured,
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
    if (origin !== undefined && origin !== deps.allowedOrigin) {
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

    const presented = (body as { token?: unknown } | null)?.token;
    if (checkToken(presented) !== null) {
      return json(res, 400, { ok: false, error: "Please reload the page and try again." });
    }
    const token = presented as Token;

    const result = validate(kind, body);
    if (!result.ok) {
      // A tripped honeypot gets the success it expects, and nothing else.
      if (result.reason === "honeypot") return json(res, 200, { ok: true });
      return json(res, 400, { ok: false, error: result.reason });
    }

    if (deps.mailMisconfigured) {
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

    // Claimed last, after every check that could still turn the request away,
    // so a typo in the email field does not cost the visitor their token.
    if (!claimToken(token)) {
      return json(res, 400, { ok: false, error: "Please reload the page and try again." });
    }

    try {
      await deps.sendSubmission(kind, result.value);
      countSend();
    } catch (err) {
      // The send did not happen, so the visitor may try again with this token.
      releaseToken(token);
      // Never log the submission itself, only that it failed.
      console.error(`send failed for ${kind}:`, err instanceof Error ? err.message : err);
      return json(res, 502, { ok: false, error: "We could not send that just now." });
    }

    acknowledge(kind, result.value);
    return json(res, 200, { ok: true });
  };
}

/** Wraps the handler so a thrown error becomes a 500, never a hung socket. */
export function createListener(deps: Deps) {
  const handle = createHandler(deps);
  return (req: IncomingMessage, res: ServerResponse): void => {
    handle(req, res).catch((err: unknown) => {
      console.error("unhandled:", err instanceof Error ? err.message : err);
      if (!res.headersSent) json(res, 500, { ok: false });
    });
  };
}
