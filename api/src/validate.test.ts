import { describe, expect, it } from "vitest";
import { headerSafe, isEmail, validate } from "./validate.js";

describe("headerSafe", () => {
  it("strips the CRLF that would let a value inject a mail header", () => {
    const attack = "Ada\r\nBcc: everyone@example.com";
    expect(headerSafe(attack)).toBe("Ada Bcc: everyone@example.com");
    expect(headerSafe(attack)).not.toContain("\r");
    expect(headerSafe(attack)).not.toContain("\n");
  });

  it("strips bare newlines and unicode line separators too", () => {
    expect(headerSafe("a\nb c d")).toBe("a b c d");
  });
});

describe("isEmail", () => {
  it.each(["a@b.co", "first.last+tag@sub.example.com"])("accepts %s", (v) => {
    expect(isEmail(v)).toBe(true);
  });

  it.each([
    "no-at-sign",
    "a@b",
    "a@.com",
    "a b@c.com",
    "a@b.com\r\nBcc: x@y.com",
    `${"a".repeat(250)}@b.com`,
  ])("rejects %s", (v) => {
    expect(isEmail(v)).toBe(false);
  });
});

describe("validate", () => {
  const ok = { name: "Ada", email: "ada@example.com", interest: "enterprise" };

  it("accepts a well-formed contact submission", () => {
    const r = validate("contact", { ...ok, message: "hello" });
    expect(r).toEqual({ ok: true, value: { ...ok, message: "hello" } });
  });

  it("ignores fields the form does not declare", () => {
    const r = validate("contact", { ...ok, isAdmin: true, extra: "x" });
    expect(r.ok && Object.keys(r.value)).toEqual(["name", "email", "interest"]);
  });

  it("rejects a value outside the allowed choices", () => {
    const r = validate("contact", { ...ok, interest: "'; DROP TABLE" });
    expect(r).toMatchObject({ ok: false });
  });

  it("rejects an over-long message rather than truncating it", () => {
    const r = validate("contact", { ...ok, message: "x".repeat(4001) });
    expect(r).toMatchObject({ ok: false, reason: "message is too long" });
  });

  it("reports a filled honeypot distinctly, so the caller can fake success", () => {
    const r = validate("contact", { ...ok, website: "http://spam" });
    expect(r).toMatchObject({ ok: false, reason: "honeypot" });
  });

  it("ignores an empty honeypot", () => {
    expect(validate("contact", { ...ok, website: "" }).ok).toBe(true);
  });

  it("requires the fields the form marks required", () => {
    expect(validate("contact", { email: "a@b.co", interest: "other" })).toMatchObject({
      ok: false,
      reason: "name is required",
    });
  });

  it("treats whitespace-only input as missing", () => {
    expect(validate("contact", { ...ok, name: "   " })).toMatchObject({ ok: false });
  });

  it("rejects a non-string field", () => {
    expect(validate("contact", { ...ok, name: { toString: 1 } })).toMatchObject({ ok: false });
  });

  it("rejects an array or null body", () => {
    expect(validate("contact", [])).toMatchObject({ ok: false });
    expect(validate("contact", null)).toMatchObject({ ok: false });
  });

  it("validates the waitlist and demo shapes too", () => {
    expect(validate("waitlist", { name: "A", email: "a@b.co", work: "consulting" }).ok).toBe(true);
    expect(validate("waitlist", { name: "A", email: "a@b.co", work: "nope" }).ok).toBe(false);
    expect(validate("demo", { name: "A", email: "a@b.co", teamSize: "11–50" }).ok).toBe(true);
    expect(validate("demo", { name: "A", email: "a@b.co", teamSize: "9000" }).ok).toBe(false);
  });
});
