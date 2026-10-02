import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createListener, type Deps } from "./app.js";
import { issueToken, type Token } from "./guard.js";

const ORIGIN = "https://kerniva.app";

let server: Server | null = null;
let serial = 0;

afterEach(async () => {
  await new Promise<void>((done) => (server ? server.close(() => done()) : done()));
  server = null;
  vi.restoreAllMocks();
});

/**
 * A token old enough to pass the age check, and different every call. The
 * step is a whole second so that the clock moving forward between two calls
 * can never land both on the same timestamp, and so on the same signature.
 */
function agedToken(): Token {
  serial += 1;
  return issueToken(Date.now() - 5_000 - serial * 1_000);
}

function setup(overrides: Partial<Deps> = {}) {
  const sendSubmission = vi.fn(async () => {});
  const sendConfirmation = vi.fn(async () => {});
  const deps: Deps = {
    allowedOrigin: ORIGIN,
    dryRun: false,
    mailMisconfigured: false,
    confirmations: true,
    sendSubmission,
    sendConfirmation,
    ...overrides,
  };
  server = createServer(createListener(deps));

  // Each harness is its own client, so the per-IP limiter never crosses tests.
  serial += 1;
  const ip = `10.9.${serial >> 8}.${serial & 255}`;

  const ready = new Promise<string>((resolve) => {
    server?.listen(0, "127.0.0.1", () => {
      resolve(`http://127.0.0.1:${(server?.address() as AddressInfo).port}`);
    });
  });

  async function post(kind: string, body: unknown, headers: Record<string, string> = {}) {
    const res = await fetch(`${await ready}/api/forms/${kind}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin: ORIGIN, "x-real-ip": ip, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
    return { status: res.status, body: (await res.json()) as { ok: boolean; error?: string } };
  }

  async function get(path: string) {
    const res = await fetch(`${await ready}${path}`, { headers: { "x-real-ip": ip } });
    return { status: res.status, body: (await res.json()) as Record<string, unknown> };
  }

  return {
    post,
    get,
    sendSubmission: deps.sendSubmission,
    sendConfirmation: deps.sendConfirmation,
  };
}

let people = 0;
/** A valid demo request from an address no other test has used. */
function demo(extra: Record<string, unknown> = {}) {
  people += 1;
  return {
    name: "Ada",
    email: `ada${people}@example.com`,
    teamSize: "11–50",
    token: agedToken(),
    ...extra,
  };
}

/** Lets the un-awaited confirmation run. */
const settle = () => new Promise((r) => setTimeout(r, 10));

describe("health", () => {
  it("reports mail state without touching the mailer", async () => {
    const { get, sendSubmission } = setup({ mailMisconfigured: true, dryRun: true });
    const r = await get("/api/health");
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ ok: true, dryRun: true, mailConfigured: false });
    expect(sendSubmission).not.toHaveBeenCalled();
  });
});

describe("request checks", () => {
  it("refuses another site's origin", async () => {
    const { post, sendSubmission } = setup();
    const r = await post("demo", demo(), { origin: "https://evil.example" });
    expect(r.status).toBe(403);
    expect(sendSubmission).not.toHaveBeenCalled();
  });

  it("refuses anything that is not JSON", async () => {
    const { post } = setup();
    const r = await post("demo", "name=Ada", {
      "content-type": "application/x-www-form-urlencoded",
    });
    expect(r.status).toBe(415);
  });

  it("refuses a form that does not exist", async () => {
    const { post } = setup();
    expect((await post("newsletter", demo())).status).toBe(404);
  });

  it("refuses a missing or fresh token", async () => {
    const { post, sendSubmission } = setup();
    expect((await post("demo", demo({ token: undefined }))).status).toBe(400);
    expect((await post("demo", demo({ token: issueToken() }))).status).toBe(400);
    expect(sendSubmission).not.toHaveBeenCalled();
  });

  it("answers a tripped honeypot with success and sends nothing", async () => {
    const { post, sendSubmission, sendConfirmation } = setup();
    const r = await post("demo", demo({ website: "https://spam.example" }));
    await settle();
    expect(r).toEqual({ status: 200, body: { ok: true } });
    expect(sendSubmission).not.toHaveBeenCalled();
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("refuses submissions, with an address to write to, when mail is not configured", async () => {
    const { post, sendSubmission } = setup({ mailMisconfigured: true });
    const r = await post("demo", demo());
    expect(r.status).toBe(503);
    expect(r.body.error).toContain("contact@kerniva.app");
    expect(sendSubmission).not.toHaveBeenCalled();
  });
});

describe("a delivered submission", () => {
  it("is mailed to the team and acknowledged to the visitor", async () => {
    const { post, sendSubmission, sendConfirmation } = setup();
    const body = demo();
    const r = await post("demo", body);
    await settle();
    expect(r).toEqual({ status: 200, body: { ok: true } });
    expect(sendSubmission).toHaveBeenCalledTimes(1);
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
    expect(sendConfirmation).toHaveBeenCalledWith(
      "demo",
      expect.objectContaining({ email: body.email }),
    );
  });

  it("is not acknowledged when confirmations are switched off", async () => {
    const { post, sendSubmission, sendConfirmation } = setup({ confirmations: false });
    expect((await post("demo", demo())).status).toBe(200);
    await settle();
    expect(sendSubmission).toHaveBeenCalledTimes(1);
    expect(sendConfirmation).not.toHaveBeenCalled();
  });

  it("still succeeds when the acknowledgement cannot be sent", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const sendConfirmation = vi.fn(async () => {
      throw new Error("550 no such user");
    });
    const { post } = setup({ sendConfirmation });
    const r = await post("demo", demo());
    await settle();
    expect(r).toEqual({ status: 200, body: { ok: true } });
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
  });

  it("never logs the visitor's address when the acknowledgement fails", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const { post } = setup({
      sendConfirmation: vi.fn(async () => {
        throw new Error("refused");
      }),
    });
    const body = demo();
    await post("demo", body);
    await settle();
    expect(JSON.stringify(log.mock.calls)).not.toContain(body.email);
  });

  it("acknowledges one address once, however many times it is submitted", async () => {
    const { post, sendSubmission, sendConfirmation } = setup();
    const email = "repeat-target@example.com";
    for (const variant of [email, email.toUpperCase(), ` ${email} `]) {
      expect((await post("demo", demo({ email: variant }))).status).toBe(200);
    }
    await settle();
    expect(sendSubmission).toHaveBeenCalledTimes(3);
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
  });
});

describe("a token", () => {
  it("delivers one submission and is refused the second time", async () => {
    const { post, sendSubmission } = setup();
    const token = agedToken();
    expect((await post("demo", demo({ token }))).status).toBe(200);
    const again = await post("demo", demo({ token }));
    expect(again.status).toBe(400);
    expect(again.body.error).toMatch(/reload/i);
    expect(sendSubmission).toHaveBeenCalledTimes(1);
  });

  it("survives a typo, so the visitor can correct it and resubmit", async () => {
    const { post, sendSubmission } = setup();
    const token = agedToken();
    expect((await post("demo", demo({ token, email: "not-an-address" }))).status).toBe(400);
    expect((await post("demo", demo({ token }))).status).toBe(200);
    expect(sendSubmission).toHaveBeenCalledTimes(1);
  });
});

describe("a failed send", () => {
  it("is reported as a failure, sends no acknowledgement, and can be retried", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const sendSubmission = vi
      .fn<Deps["sendSubmission"]>()
      .mockRejectedValueOnce(new Error("connection refused"))
      .mockResolvedValue(undefined);
    const { post, sendConfirmation } = setup({ sendSubmission });
    const body = demo();

    const failed = await post("demo", body);
    await settle();
    expect(failed.status).toBe(502);
    expect(failed.body.ok).toBe(false);
    expect(sendConfirmation).not.toHaveBeenCalled();

    // Same token: the first attempt delivered nothing, so it was handed back.
    const retried = await post("demo", body);
    await settle();
    expect(retried.status).toBe(200);
    expect(sendConfirmation).toHaveBeenCalledTimes(1);
  });
});
