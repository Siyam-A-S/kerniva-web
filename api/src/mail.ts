import nodemailer, { type Transporter } from "nodemailer";
import {
  CONTACT_ROUTES,
  EMAIL_CONTACT,
  FORM_ROUTES,
  type ContactInterest,
  type FormKind,
} from "../../shared/forms.js";
import { headerSafe, isEmail, type Clean } from "./validate.js";

const FROM = process.env.MAIL_FROM || `Kerniva site <${EMAIL_CONTACT}>`;
const DRY_RUN = process.env.SMTP_HOST === undefined;

let transport: Transporter | null = null;

export function initMail(): void {
  if (DRY_RUN) return;
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

export function isDryRun(): boolean {
  return DRY_RUN;
}

const SUBJECTS: Record<FormKind, string> = {
  contact: "Contact",
  waitlist: "Waitlist signup",
  demo: "Demo request",
};

function routeFor(kind: FormKind, fields: Clean): string {
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

export async function sendSubmission(kind: FormKind, fields: Clean): Promise<void> {
  const to = routeFor(kind, fields);
  const who = fields.name ? headerSafe(fields.name).slice(0, 60) : "someone";
  const subject = `${SUBJECTS[kind]}: ${who}`;
  const text = render(kind, fields);

  // From is always our own verified address. Putting the visitor's address
  // there would fail SPF and DMARC; it belongs in Reply-To, where hitting
  // reply in Gmail still reaches them.
  const message = {
    from: FROM,
    to,
    subject,
    text,
    ...(fields.email && isEmail(fields.email) ? { replyTo: fields.email } : {}),
  };

  if (DRY_RUN || transport === null) {
    console.log(`[dry-run] would send to ${to}: ${subject}`);
    return;
  }
  await transport.sendMail(message);
}
