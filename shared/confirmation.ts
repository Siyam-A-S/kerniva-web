/**
 * The acknowledgement a visitor receives after a form is delivered to the
 * team. Pure data, like `forms.ts`, because the API cannot import the React
 * module that holds the rest of the site's copy.
 *
 * Every word here is fixed. Nothing the visitor typed is ever placed in this
 * message, not even their name: the address on a form is unverified, so
 * anything echoed back could be aimed at a stranger's inbox. A fixed note is
 * useless to someone trying to send their own text through our domain.
 */
import { EMAIL_CONTACT, type FormKind } from "./forms.js";

export type Confirmation = { subject: string; body: string };

const SIGN_OFF = [
  `This is an automated message and replies to it are not read. To reach us, write to ${EMAIL_CONTACT}.`,
  "",
  "If you did not fill in a form on kerniva.app, you can ignore this email. Nothing else will be sent.",
  "",
  "Kerniva",
  "https://kerniva.app",
].join("\n");

export const CONFIRMATIONS: Record<FormKind, Confirmation> = {
  contact: {
    subject: "We received your message",
    body: [
      "Thank you for getting in touch with Kerniva.",
      "",
      "Your message reached the team, and someone will reply to this address.",
      "",
      SIGN_OFF,
    ].join("\n"),
  },
  demo: {
    subject: "We received your demo request",
    body: [
      "Thank you for booking a Kerniva demo.",
      "",
      "Your request reached the team. To start a fresh workspace of your own, sign up at https://live.kerniva.app with this same email address.",
      "",
      SIGN_OFF,
    ].join("\n"),
  },
};
