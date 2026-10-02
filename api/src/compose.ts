import { CONFIRMATIONS } from "../../shared/confirmation.js";
import {
  CONTACT_ROUTES,
  EMAIL_CONTACT,
  FORM_ROUTES,
  type ContactInterest,
  type FormKind,
} from "../../shared/forms.js";
import { headerSafe, isEmail, type Clean } from "./validate.js";

/**
 * Everything about a message that can be decided without a mail library, kept
 * apart from `mail.ts` so it can be tested without one.
 */
export type Message = {
  from: string;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
  headers?: Record<string, string>;
};

export type Smtp = { host: string; port: number; secure: boolean; user?: string; pass?: string };

type Env = Record<string, string | undefined>;

/**
 * Null means dry run. An empty or blank SMTP_HOST counts as unset: hosting
 * platforms and infrastructure code routinely pass an empty string for a
 * variable nobody filled in, and treating that as a real host built a
 * transport that failed every send while health reported mail as configured.
 */
export function smtpSettings(env: Env = process.env): Smtp | null {
  const host = env.SMTP_HOST?.trim();
  if (!host) return null;

  const parsed = Number(env.SMTP_PORT?.trim() || 587);
  const port = Number.isInteger(parsed) && parsed > 0 ? parsed : 587;
  const user = env.SMTP_USER?.trim();
  const pass = env.SMTP_PASS;
  return {
    host,
    port,
    secure: port === 465,
    ...(user ? { user } : {}),
    ...(pass ? { pass } : {}),
  };
}

export function mailFrom(env: Env = process.env): string {
  return env.MAIL_FROM?.trim() || `Kerniva site <${EMAIL_CONTACT}>`;
}

const SUBJECTS: Record<FormKind, string> = {
  contact: "Contact",
  demo: "Demo request",
};

export function routeFor(kind: FormKind, fields: Clean): string {
  if (kind === "contact" && fields.interest) {
    return CONTACT_ROUTES[fields.interest as ContactInterest] ?? EMAIL_CONTACT;
  }
  return FORM_ROUTES[kind];
}

/** Plain text only: there is no markup for a submitted value to break out of. */
function render(kind: FormKind, fields: Clean): string {
  const lines = [`New ${SUBJECTS[kind].toLowerCase()} from kerniva.app`, ""];
  for (const [key, value] of Object.entries(fields)) {
    lines.push(`${key}: ${value}`);
  }
  lines.push("", `Received ${new Date().toISOString()}`);
  return lines.join("\n");
}

/** The submission, addressed to the team. */
export function composeSubmission(kind: FormKind, fields: Clean, from: string): Message {
  const who = fields.name ? headerSafe(fields.name).slice(0, 60) : "someone";

  // From is always our own verified address. Putting the visitor's address
  // there would fail SPF and DMARC; it belongs in Reply-To, where hitting
  // reply in Gmail still reaches them.
  return {
    from,
    to: routeFor(kind, fields),
    subject: `${SUBJECTS[kind]}: ${who}`,
    text: render(kind, fields),
    ...(fields.email && isEmail(fields.email) ? { replyTo: fields.email } : {}),
  };
}

/**
 * The acknowledgement, addressed to the visitor. The only thing taken from the
 * submission is where to send it; subject and body are fixed copy. Null when
 * there is no usable address.
 */
export function composeConfirmation(kind: FormKind, fields: Clean, from: string): Message | null {
  const to = fields.email;
  if (!to || !isEmail(to)) return null;

  const { subject, body } = CONFIRMATIONS[kind];
  return {
    from,
    to,
    subject,
    text: body,
    // No Reply-To: this is a no-reply notice. The body names the address to
    // write to instead, and the conversation continues when the team answers
    // the submission itself.
    // Tells autoresponders not to answer, so two robots never loop.
    headers: { "Auto-Submitted": "auto-generated" },
  };
}
