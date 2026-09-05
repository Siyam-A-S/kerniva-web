import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { TOKEN_MAX_AGE_MS, TOKEN_MIN_AGE_MS } from "../../shared/forms.js";

const SECRET = process.env.FORM_TOKEN_SECRET || randomBytes(32).toString("hex");

export type Token = { ts: number; sig: string };

export function issueToken(): Token {
  const ts = Date.now();
  return { ts, sig: sign(ts) };
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

/**
 * Bounds the damage when every other guard fails: a bad day costs one day of
 * mail, not a mailbombed inbox and a burned sending reputation.
 */
const DAILY_CAP = Number(process.env.DAILY_SEND_CAP ?? 200);
let day = utcDay();
let sentToday = 0;

function utcDay(): number {
  return Math.floor(Date.now() / 86_400_000);
}

export function overDailyCap(): boolean {
  if (utcDay() !== day) {
    day = utcDay();
    sentToday = 0;
  }
  return sentToday >= DAILY_CAP;
}

export function countSend(): void {
  sentToday += 1;
}

export function sentTodayCount(): number {
  return sentToday;
}

/** Drop idle clients so the map cannot grow without bound. */
export function pruneRateLimits(now = Date.now()): void {
  const longest = Math.max(...WINDOWS.map((w) => w.windowMs));
  for (const [ip, times] of hits) {
    const recent = times.filter((t) => now - t < longest);
    if (recent.length === 0) hits.delete(ip);
    else hits.set(ip, recent);
  }
}
