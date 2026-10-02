import { describe, expect, it } from "vitest";
import { CONFIRMATIONS } from "../../shared/confirmation.js";
import { FORM_KINDS } from "../../shared/forms.js";
import {
  composeConfirmation,
  composeSubmission,
  mailFrom,
  routeFor,
  smtpSettings,
} from "./compose.js";

const FROM = "Kerniva <noreply@kerniva.app>";

describe("smtpSettings", () => {
  it("is a dry run when SMTP_HOST is missing", () => {
    expect(smtpSettings({})).toBeNull();
  });

  it.each(["", "   ", "\n"])("is a dry run when SMTP_HOST is blank (%j)", (host) => {
    expect(smtpSettings({ SMTP_HOST: host })).toBeNull();
  });

  it("defaults to STARTTLS on 587", () => {
    expect(smtpSettings({ SMTP_HOST: "smtp.gmail.com" })).toEqual({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
    });
  });

  it("uses implicit TLS only on 465", () => {
    expect(smtpSettings({ SMTP_HOST: "h", SMTP_PORT: "465" })?.secure).toBe(true);
    expect(smtpSettings({ SMTP_HOST: "h", SMTP_PORT: "2525" })?.secure).toBe(false);
  });

  it("falls back to 587 when the port is not a number", () => {
    expect(smtpSettings({ SMTP_HOST: "h", SMTP_PORT: "smtp" })?.port).toBe(587);
    expect(smtpSettings({ SMTP_HOST: "h", SMTP_PORT: "" })?.port).toBe(587);
  });

  it("carries credentials only when they are set", () => {
    const s = smtpSettings({ SMTP_HOST: "h", SMTP_USER: " u@kerniva.app ", SMTP_PASS: "p" });
    expect(s).toMatchObject({ user: "u@kerniva.app", pass: "p" });
    expect(smtpSettings({ SMTP_HOST: "h", SMTP_USER: "" })).not.toHaveProperty("user");
  });
});

describe("mailFrom", () => {
  it("uses MAIL_FROM when set and our own address otherwise", () => {
    expect(mailFrom({ MAIL_FROM: FROM })).toBe(FROM);
    expect(mailFrom({})).toBe("Kerniva site <contact@kerniva.app>");
    expect(mailFrom({ MAIL_FROM: "  " })).toBe("Kerniva site <contact@kerniva.app>");
  });
});

describe("routing", () => {
  it("sends each kind of enquiry to the right group", () => {
    expect(routeFor("contact", { interest: "enterprise" })).toBe("sales@kerniva.app");
    expect(routeFor("contact", { interest: "security" })).toBe("security@kerniva.app");
    expect(routeFor("contact", { interest: "research" })).toBe("contact@kerniva.app");
    expect(routeFor("contact", {})).toBe("contact@kerniva.app");
    expect(routeFor("waitlist", {})).toBe("contact@kerniva.app");
    expect(routeFor("demo", {})).toBe("sales@kerniva.app");
  });
});

describe("composeSubmission", () => {
  const fields = { name: "Ada", email: "ada@example.com", interest: "enterprise" };

  it("is from us, to the team, with the visitor in Reply-To", () => {
    const m = composeSubmission("contact", fields, FROM);
    expect(m.from).toBe(FROM);
    expect(m.to).toBe("sales@kerniva.app");
    expect(m.replyTo).toBe("ada@example.com");
    expect(m.subject).toBe("Contact: Ada");
  });

  it("keeps a crafted name on one subject line", () => {
    const m = composeSubmission("contact", { ...fields, name: "Ada\r\nBcc: x@y.com" }, FROM);
    expect(m.subject).not.toMatch(/[\r\n]/);
  });

  it("leaves Reply-To out when the address is not one", () => {
    const m = composeSubmission("contact", { ...fields, email: "a@b.com\r\nBcc: x@y.com" }, FROM);
    expect(m).not.toHaveProperty("replyTo");
  });
});

describe("composeConfirmation", () => {
  const SENTINEL = "XSENTINELX";
  // Every field a form can carry, each one hostile.
  const hostile = {
    name: `${SENTINEL}\r\nBcc: victim@example.com`,
    email: "visitor@example.com",
    org: `${SENTINEL} org`,
    company: `${SENTINEL} company`,
    interest: "security",
    work: "research",
    teamSize: "200+",
    message: `${SENTINEL} http://evil.example/ buy now`,
    notes: `${SENTINEL} notes`,
  };

  it.each(FORM_KINDS)("puts nothing the visitor typed into the %s message", (kind) => {
    const m = composeConfirmation(kind, hostile, FROM);
    expect(m).not.toBeNull();
    const everything = JSON.stringify(m);
    expect(everything).not.toContain(SENTINEL);
    expect(everything).not.toContain("victim@example.com");
    expect(everything).not.toContain("evil.example");
    // The body is the fixed copy, byte for byte.
    expect(m?.subject).toBe(CONFIRMATIONS[kind].subject);
    expect(m?.text).toBe(CONFIRMATIONS[kind].body);
  });

  it("goes only to the visitor, from us, with replies routed to the team", () => {
    const m = composeConfirmation("contact", hostile, FROM);
    expect(m?.to).toBe("visitor@example.com");
    expect(m?.from).toBe(FROM);
    expect(m?.replyTo).toBe("security@kerniva.app");
    expect(m?.headers).toEqual({ "Auto-Submitted": "auto-generated" });
  });

  it.each(["", "not-an-address", "a@b.com\r\nBcc: x@y.com", "a@b.com, c@d.com"])(
    "sends nothing when the address is %j",
    (email) => {
      expect(composeConfirmation("waitlist", { ...hostile, email }, FROM)).toBeNull();
    },
  );

  it("sends nothing when there is no address at all", () => {
    expect(composeConfirmation("waitlist", { name: "Ada" }, FROM)).toBeNull();
  });
});

describe("confirmation copy", () => {
  it.each(FORM_KINDS)("has a single-line subject and no em dash for %s", (kind) => {
    const { subject, body } = CONFIRMATIONS[kind];
    expect(subject).not.toMatch(/[\r\n]/);
    expect(subject + body).not.toContain(String.fromCharCode(0x2014));
  });
});
