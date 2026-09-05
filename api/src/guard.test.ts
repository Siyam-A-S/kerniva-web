import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkToken, issueToken, pruneRateLimits, rateLimited } from "./guard.js";

describe("form token", () => {
  it("rejects a submission with no token", () => {
    expect(checkToken(undefined)).toBe("missing token");
  });

  it("rejects a forged signature", () => {
    const { ts } = issueToken();
    expect(checkToken({ ts, sig: "f".repeat(64) })).toBe("bad token");
  });

  it("rejects a signature of the wrong length without throwing", () => {
    const { ts } = issueToken();
    expect(checkToken({ ts, sig: "short" })).toBe("bad token");
  });

  it("rejects a token presented faster than a human could", () => {
    const t = issueToken();
    expect(checkToken(t)).toBe("too fast");
  });

  it("accepts a genuine token after the minimum delay", () => {
    const t = issueToken();
    expect(checkToken(t, t.ts + 5_000)).toBeNull();
  });

  it("rejects a stale token", () => {
    const t = issueToken();
    expect(checkToken(t, t.ts + 3 * 60 * 60 * 1000)).toBe("expired");
  });

  it("rejects a timestamp from the future", () => {
    const t = issueToken();
    expect(checkToken(t, t.ts - 1_000)).toBe("bad token");
  });
});

describe("rate limit", () => {
  beforeEach(() => pruneRateLimits(Date.now() + 86_400_000));

  it("allows a normal burst and then blocks", () => {
    const ip = `10.0.0.${Math.floor(Math.random() * 250)}`;
    const now = Date.now();
    for (let i = 0; i < 10; i++) {
      expect(rateLimited(ip, now + i)).toBe(false);
    }
    expect(rateLimited(ip, now + 11)).toBe(true);
  });

  it("lets the window slide", () => {
    const ip = "10.1.1.1";
    const now = Date.now();
    for (let i = 0; i < 10; i++) rateLimited(ip, now + i);
    expect(rateLimited(ip, now + 11)).toBe(true);
    expect(rateLimited(ip, now + 61_000)).toBe(false);
  });

  it("tracks clients independently", () => {
    const now = Date.now();
    for (let i = 0; i < 10; i++) rateLimited("10.2.2.2", now + i);
    expect(rateLimited("10.2.2.2", now + 11)).toBe(true);
    expect(rateLimited("10.3.3.3", now + 11)).toBe(false);
  });
});

describe("hourly ceiling", () => {
  it("blocks sustained low-rate abuse that slips past the minute window", () => {
    const ip = "10.4.4.4";
    const start = Date.now();
    // Five per minute for seven minutes: never trips the minute window of
    // ten, but crosses the hourly ceiling of thirty.
    let blocked = 0;
    for (let m = 0; m < 7; m++) {
      for (let i = 0; i < 5; i++) {
        if (rateLimited(ip, start + m * 60_000 + i)) blocked++;
      }
    }
    expect(blocked).toBeGreaterThan(0);
  });
});

vi.mock("node:crypto", async (orig) => orig());
