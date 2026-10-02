import nodemailer, { type Transporter } from "nodemailer";
import type { FormKind } from "../../shared/forms.js";
import {
  composeConfirmation,
  composeSubmission,
  mailFrom,
  smtpSettings,
  type Message,
} from "./compose.js";
import type { Clean } from "./validate.js";

const FROM = mailFrom();
const SMTP = smtpSettings();

let transport: Transporter | null = null;

export function initMail(): void {
  if (SMTP === null) return;
  transport = nodemailer.createTransport({
    host: SMTP.host,
    port: SMTP.port,
    secure: SMTP.secure,
    // On 587 the session must upgrade before credentials go over the wire.
    requireTLS: !SMTP.secure,
    ...(SMTP.user ? { auth: { user: SMTP.user, pass: SMTP.pass } } : {}),
    // nginx gives a submission 15 seconds; fail inside that, not after it.
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
  });
}

export function isDryRun(): boolean {
  return SMTP === null;
}

async function deliver(message: Message, what: string): Promise<void> {
  if (transport === null) {
    console.log(`[dry-run] would send ${what}`);
    return;
  }
  await transport.sendMail(message);
}

export async function sendSubmission(kind: FormKind, fields: Clean): Promise<void> {
  const message = composeSubmission(kind, fields, FROM);
  await deliver(message, `to ${message.to}: ${message.subject}`);
}

export async function sendConfirmation(kind: FormKind, fields: Clean): Promise<void> {
  const message = composeConfirmation(kind, fields, FROM);
  if (message === null) return;
  // The visitor's address stays out of the log.
  await deliver(message, `a ${kind} confirmation`);
}
