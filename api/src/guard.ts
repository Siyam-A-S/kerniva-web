import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { TOKEN_MAX_AGE_MS, TOKEN_MIN_AGE_MS } from "../../shared/forms.js";

const SECRET = process.env.FORM_TOKEN_SECRET || randomBytes(32).toString("hex");
const DAY_MS = 86_400_000;

export type Token = { ts: number; sig: string };

export function issueToken(now = Date.now()): Token {
  return { ts: now, sig: sign(now) };
}

function sign(ts: number): string {
  return createHmac("sha256", SECRET).update(String(ts)).digest("hex");
}

/**
 * The signature is what makes the age check worth anything: without it a bot
 * simply posts a plausible timestamp.
 */
export function checkToken(token: unknown, now = Date.now()): string | null {
  if (typeof token !== "object" || token === null) return "missing token";
  const { ts, sig } = token as Partial<Token>;
  if (typeof ts !== "number" || !Number.isFinite(ts)) return "bad token";
  if (typeof sig !== "string") return "bad token";

  const expected = sign(ts);
  const a = Buffer.from(sig, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "bad token";

  const age = now - ts;
  if (age < 0) return "bad token";
  if (age < TOKEN_MIN_AGE_MS) return "too fast";
  if (age > TOKEN_MAX_AGE_MS) return "expired";
  return null;
}

/* ------------------------------------------------------------ single use --- */

/** Signature of each token that has carried a submission, with its issue time. */
const spent = new Map<string, number>();

/**
 * A token buys one delivered submission. Without this a single token could be
 * replayed for its whole two-hour life, and every replay now also costs a
 * message to whatever address the body names. Call only after `checkToken`
 * has passed; false means the token was already used.
 */
export function claimToken(token: Token): boolean {
  if (spent.has(token.sig)) return false;
  spent.set(token.sig, token.ts);
  return true;
}

/** Hands a token back when the send it was claimed for did not happen. */
export function releaseToken(token: Token): void {
  spent.delete(token.sig);
}

/* ------------------------------------------------------------ rate limit --- */

type Window = { windowMs: number; limit: number };
const WINDOWS: Window[] = [
  { windowMs: 60_000, limit: 10 },
  { windowMs: 3_600_000, limit: 30 },
];

const hits = new Map<string, number[]>();

/**
 * Sliding window per client, kept in memory: one container, low volume. Every
 * request counts, including rejected ones, so a bot cannot probe for free. The
 * limits are loose enough that a person who mistypes their email a few times
 * is never caught.
 */
export function rateLimited(ip: string, now = Date.now()): boolean {
  const longest = Math.max(...WINDOWS.map((w) => w.windowMs));
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < longest);

  for (const w of WINDOWS) {
    if (recent.filter((t) => now - t < w.windowMs).length >= w.limit) {
      hits.set(ip, recent);
      return true;
    }
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/* ------------------------------------------------------------ daily caps --- */

/**
 * A cap that cannot be read is not "no cap". `Number("")` is 0 and
 * `Number("lots")` is NaN, and a count is never `>= NaN`, so a typo in the
 * environment used to switch the ceiling off without a word.
 */
export function capFrom(raw: string | undefined, fallback: number): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
}

/** Counts events per UTC day and starts again at midnight. */
export function dailyCounter(limit: number) {
  let day = Math.floor(Date.now() / DAY_MS);
  let count = 0;

  function roll(now: number): void {
    const today = Math.floor(now / DAY_MS);
    if (today !== day) {
      day = today;
      count = 0;
    }
  }

  return {
    full(now = Date.now()): boolean {
      roll(now);
      return count >= limit;
    },
    add(now = Date.now()): void {
      roll(now);
      count += 1;
    },
    count(now = Date.now()): number {
      roll(now);
      return count;
    },
  };
}

/**
 * Bounds the damage when every other guard fails: a bad day costs one day of
 * mail, not a mailbombed inbox and a burned sending reputation. Every message
 * that leaves counts here, confirmations included.
 */
const sends = dailyCounter(capFrom(process.env.DAILY_SEND_CAP, 200));

/**
 * Confirmations go to addresses nobody has verified, so they get a ceiling of
 * their own, below the overall one: they can never use up the allowance that
 * delivers submissions to the team.
 */
const confirmations = dailyCounter(capFrom(process.env.CONFIRM_DAILY_CAP, 100));

export function overDailyCap(): boolean {
  return sends.full();
}

export function countSend(): void {
  sends.add();
}

export function sentTodayCount(): number {
  return sends.count();
}

/* --------------------------------------------------------- confirmations --- */

/** Keyed hash of each address recently written to, with when. */
const confirmed = new Map<string, number>();

function addressKey(email: string): string {
  return createHmac("sha256", SECRET).update(email.trim().toLowerCase()).digest("hex");
}

/**
 * Decides whether an acknowledgement may go to this address, and records it
 * if so. One per address per day: however many times a form is submitted with
 * someone's address, they hear from us once. Only a keyed hash is kept, so the
 * process holds no list of addresses.
 */
export function claimConfirmation(email: string, now = Date.now()): boolean {
  if (sends.full(now) || confirmations.full(now)) return false;

  const key = addressKey(email);
  const last = confirmed.get(key);
  if (last !== undefined && now - last < DAY_MS) return false;

  confirmed.set(key, now);
  sends.add(now);
  confirmations.add(now);
  return true;
}

/* ---------------------------------------------------------------- upkeep --- */

/** Drop idle clients and expired records so no map can grow without bound. */
export function pruneRateLimits(now = Date.now()): void {
  const longest = Math.max(...WINDOWS.map((w) => w.windowMs));
  for (const [ip, times] of hits) {
    const recent = times.filter((t) => now - t < longest);
    if (recent.length === 0) hits.delete(ip);
    else hits.set(ip, recent);
  }
  // A token past its maximum age is refused by `checkToken` anyway.
  for (const [sig, ts] of spent) {
    if (now - ts > TOKEN_MAX_AGE_MS) spent.delete(sig);
  }
  for (const [key, at] of confirmed) {
    if (now - at >= DAY_MS) confirmed.delete(key);
  }
}
