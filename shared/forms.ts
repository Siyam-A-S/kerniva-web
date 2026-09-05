/**
 * The wire contract for the three site forms, shared by the browser and the
 * API so validation cannot drift between them. Pure data: no React, no Node,
 * so both sides can import it.
 *
 * Labels live in `src/content.tsx` with the rest of the copy. Only values,
 * limits, and routing belong here, because changing one of these changes what
 * the server accepts.
 */

export const EMAIL_CONTACT = "contact@kerniva.app";
export const EMAIL_SALES = "sales@kerniva.app";
export const EMAIL_SUPPORT = "support@kerniva.app";
export const EMAIL_SECURITY = "security@kerniva.app";

export const FORM_KINDS = ["contact", "waitlist", "demo"] as const;
export type FormKind = (typeof FORM_KINDS)[number];

export const CONTACT_INTEREST_VALUES = ["enterprise", "research", "security", "other"] as const;
export type ContactInterest = (typeof CONTACT_INTEREST_VALUES)[number];

export const WAITLIST_WORK_VALUES = ["consulting", "research", "product", "other"] as const;
export type WaitlistWork = (typeof WAITLIST_WORK_VALUES)[number];

export const DEMO_TEAM_SIZE_VALUES = ["1–10", "11–50", "51–200", "200+"] as const;
export type DemoTeamSize = (typeof DEMO_TEAM_SIZE_VALUES)[number];

/**
 * Longest accepted value per field. Over-long input is rejected rather than
 * truncated: silently mangling someone's message is worse than saying no.
 */
export const MAX = {
  name: 120,
  email: 254, // RFC 5321 maximum reverse-path length
  org: 120,
  company: 120,
  message: 4000,
  notes: 2000,
} as const;

/** Whole-body cap, enforced by nginx and again while reading the stream. */
export const MAX_BODY_BYTES = 8 * 1024;

/**
 * A field positioned off-screen that a person never sees and never fills.
 * Bots fill every input they find, so a value here is a reliable tell.
 */
export const HONEYPOT_FIELD = "website";

/**
 * A form token is issued when the form mounts and presented on submit, so a
 * submission costs two round trips with a human-plausible gap between them.
 */
export const TOKEN_MIN_AGE_MS = 3_000;
export const TOKEN_MAX_AGE_MS = 2 * 60 * 60 * 1000;

export type FieldSpec = {
  name: string;
  required: boolean;
  max?: number;
  oneOf?: readonly string[];
  email?: boolean;
};

/** The only fields the server will read. Anything else in the body is ignored. */
export const FORM_FIELDS: Record<FormKind, readonly FieldSpec[]> = {
  contact: [
    { name: "name", required: true, max: MAX.name },
    { name: "email", required: true, max: MAX.email, email: true },
    { name: "org", required: false, max: MAX.org },
    { name: "interest", required: true, oneOf: CONTACT_INTEREST_VALUES },
    { name: "message", required: false, max: MAX.message },
  ],
  waitlist: [
    { name: "name", required: true, max: MAX.name },
    { name: "email", required: true, max: MAX.email, email: true },
    { name: "org", required: false, max: MAX.org },
    { name: "work", required: true, oneOf: WAITLIST_WORK_VALUES },
  ],
  demo: [
    { name: "name", required: true, max: MAX.name },
    { name: "email", required: true, max: MAX.email, email: true },
    { name: "company", required: false, max: MAX.company },
    { name: "teamSize", required: true, oneOf: DEMO_TEAM_SIZE_VALUES },
    { name: "notes", required: false, max: MAX.notes },
  ],
};

/** Which group each enquiry is delivered to. */
export const CONTACT_ROUTES: Record<ContactInterest, string> = {
  enterprise: EMAIL_SALES,
  security: EMAIL_SECURITY,
  research: EMAIL_CONTACT,
  other: EMAIL_CONTACT,
};

export const FORM_ROUTES: Record<FormKind, string> = {
  contact: EMAIL_CONTACT, // refined per interest by CONTACT_ROUTES
  waitlist: EMAIL_CONTACT,
  demo: EMAIL_SALES,
};

export const API_BASE = "/api/forms";
