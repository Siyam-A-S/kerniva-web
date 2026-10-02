import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  capFrom,
  checkToken,
  claimConfirmation,
  claimToken,
  dailyCounter,
  issueToken,
  pruneRateLimits,
  rateLimited,
  releaseToken,
  sentTodayCount,
} from "./guard.js";

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

describe("single-use token", () => {
  it("can be claimed once", () => {
    const t = issueToken(Date.now() - 10_000);
    expect(claimToken(t)).toBe(true);
    expect(claimToken(t)).toBe(false);
  });

  it("can be claimed again after it is released", () => {
    const t = issueToken(Date.now() - 11_000);
    expect(claimToken(t)).toBe(true);
    releaseToken(t);
    expect(claimToken(t)).toBe(true);
  });

  it("is forgotten once it is too old to pass the age check anyway", () => {
    const t = issueToken(Date.now() - 12_000);
    expect(claimToken(t)).toBe(true);
    pruneRateLimits(t.ts + 3 * 60 * 60 * 1000);
    expect(claimToken(t)).toBe(true);
  });
});

describe("capFrom", () => {
  it("reads a whole number", () => {
    expect(capFrom("50", 200)).toBe(50);
    expect(capFrom("0", 200)).toBe(0);
  });

  it.each([undefined, "", "  ", "lots", "-5", "1.5", "NaN"])(
    "keeps the default rather than lifting the cap for %j",
    (raw) => {
      expect(capFrom(raw, 200)).toBe(200);
    },
  );
});

describe("dailyCounter", () => {
  const DAY = 86_400_000;
  const noon = Math.floor(Date.now() / DAY) * DAY + DAY / 2;

  it("fills at its limit", () => {
    const c = dailyCounter(2);
    expect(c.full(noon)).toBe(false);
    c.add(noon);
    expect(c.full(noon)).toBe(false);
    c.add(noon);
    expect(c.full(noon)).toBe(true);
    expect(c.count(noon)).toBe(2);
  });

  it("starts again on the next UTC day", () => {
    const c = dailyCounter(1);
    c.add(noon);
    expect(c.full(noon)).toBe(true);
    expect(c.full(noon + DAY)).toBe(false);
    expect(c.count(noon + DAY)).toBe(0);
  });

  it("is always full at a limit of zero", () => {
    expect(dailyCounter(0).full(noon)).toBe(true);
  });
});

describe("confirmation claim", () => {
  const DAY = 86_400_000;

  it("allows one acknowledgement per address per day", () => {
    const now = Date.now();
    expect(claimConfirmation("once@example.com", now)).toBe(true);
    expect(claimConfirmation("once@example.com", now + 1_000)).toBe(false);
    expect(claimConfirmation("once@example.com", now + DAY - 1)).toBe(false);
  });

  it("treats case and padding as the same address", () => {
    const now = Date.now();
    expect(claimConfirmation("Mixed@Example.com", now)).toBe(true);
    expect(claimConfirmation(" mixed@example.COM ", now)).toBe(false);
  });

  it("counts against the overall send total", () => {
    const before = sentTodayCount();
    expect(claimConfirmation("counted@example.com")).toBe(true);
    expect(sentTodayCount()).toBe(before + 1);
    expect(claimConfirmation("counted@example.com")).toBe(false);
    expect(sentTodayCount()).toBe(before + 1);
  });
});

vi.mock("node:crypto", async (orig) => orig());
