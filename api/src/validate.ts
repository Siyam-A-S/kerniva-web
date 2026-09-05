import { FORM_FIELDS, HONEYPOT_FIELD, type FormKind } from "../../shared/forms.js";

export type Clean = Record<string, string>;
export type Result = { ok: true; value: Clean } | { ok: false; reason: string };

/**
 * Collapse every run of whitespace, line breaks included, in anything that may
 * reach a mail header. Without this a crafted name turns one header into
 * several and the form becomes an open relay: the classic contact-form
 * vulnerability.
 */
export function headerSafe(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Deliberately stricter than RFC 5322: no quoted local parts, no comments, no
 * display names. This value is echoed into Reply-To, so narrow beats complete.
 */
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z]{2,})+$/;

export function isEmail(s: string): boolean {
  return s.length <= 254 && EMAIL_RE.test(s);
}

/**
 * Reads only the fields the form declares. Unknown keys are ignored rather
 * than rejected, so an extra field added to the page cannot take the endpoint
 * down before the server is redeployed.
 */
export function validate(kind: FormKind, body: unknown): Result {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { ok: false, reason: "body must be an object" };
  }
  const raw = body as Record<string, unknown>;

  // A filled honeypot is a bot. The caller answers 200 anyway, so it learns nothing.
  const honey = raw[HONEYPOT_FIELD];
  if (typeof honey === "string" && honey.trim() !== "") {
    return { ok: false, reason: "honeypot" };
  }

  const value: Clean = {};
  for (const spec of FORM_FIELDS[kind]) {
    const v = raw[spec.name];

    if (v === undefined || v === null || v === "") {
      if (spec.required) return { ok: false, reason: `${spec.name} is required` };
      continue;
    }
    if (typeof v !== "string") return { ok: false, reason: `${spec.name} must be text` };

    const trimmed = v.trim();
    if (trimmed === "") {
      if (spec.required) return { ok: false, reason: `${spec.name} is required` };
      continue;
    }
    if (spec.max !== undefined && trimmed.length > spec.max) {
      return { ok: false, reason: `${spec.name} is too long` };
    }
    if (spec.oneOf && !spec.oneOf.includes(trimmed)) {
      return { ok: false, reason: `${spec.name} is not a valid choice` };
    }
    if (spec.email && !isEmail(trimmed)) {
      return { ok: false, reason: "that email address does not look right" };
    }
    value[spec.name] = trimmed;
  }
  return { ok: true, value };
}
