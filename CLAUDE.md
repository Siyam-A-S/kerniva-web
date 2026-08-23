# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing site for kerniva.app plus the packaging that serves the public **"Try Kerniva" simulation** at `/try`. Sibling of the product monorepo at `../kerniva` (GitHub `Siyam-A-S/kerniva`); read its `CLAUDE.md`/`AGENTS.md` for product concepts (Relay, Library, proposals, Cockpit, sensitivity tiers, event-log-is-truth) and keep copy consistent with them.

## Commands

```bash
pnpm install
pnpm dev            # Vite on :4180 (KERNIVA_SITE_PORT overrides)
pnpm check          # tsc -b — the only lint
pnpm test           # vitest (none yet); single test: pnpm vitest run <file>
pnpm build          # tsc -b && vite build → dist/
pnpm format         # prettier (CI runs format:check)
```

Toolchain pinned in `mise.toml` (Node 24, pnpm 10.14.0). `node` is not on PATH without mise: `mise exec -- pnpm …` or prepend `~/.local/share/mise/installs/node/24/bin`. There is no `docker` here — use `podman` (e.g. to validate nginx: `podman run --rm -v $PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro -v $PWD/kerniva-proxy.inc:/etc/nginx/kerniva-proxy.inc:ro --add-host api:127.0.0.1 --entrypoint sh docker.io/library/nginx:1.27-alpine -c 'nginx -t'`).

## Two "demos" — don't confuse them

- **`/try`** — the real thing. A full Kerniva stack in sandbox mode (`KERNIVA_AUTH_MODE=sandbox`) built from the monorepo's `try-kerniva-simulation` branch. It is **not a route in this SPA**; nginx serves its bundle from `/srv/try` and proxies `/try/api/` to the API container. All primary CTAs link here with plain `<a href="/try">` (not `<Link>`, which would route inside the SPA and 404).
- **`/demo`** — the scripted, client-only preview in `src/demo/` (`model.ts` = data model + keyword-matched agent, `demo-page.tsx` = reducer where every action appends to a project event log). No backend. Kept as a fallback and linked only from the footer. Preserve the product rule there: agents propose, only the driver approves, artifacts appear only after approval, assets above the project's max tier are excluded from context.

## Hosting (current): Coolify + Cloudflare, one image

```
Cloudflare (proxied DNS, WAF, rate limits, cache)
  └─ Coolify/Traefik on one VM
       └─ docker-compose resource from ../kerniva/infra/coolify/docker-compose.yml
            web  = ghcr.io/siyam-a-s/kerniva-site   ← built from THIS repo's Dockerfile
            api, janitor, worker×2, query, postgres, minio, elasticmq
```

- `Dockerfile`: multi-stage — pulls `ghcr.io/siyam-a-s/kerniva-try-web` (the monorepo's built `/try` bundle, arg `TRY_IMAGE`), builds this site, and ships both in `nginx:1.27-alpine` with `nginx.conf` + `kerniva-proxy.inc`. A site deploy never needs the monorepo checkout.
- `.github/workflows/deploy-coolify.yml`: on push to `main`, builds and pushes `kerniva-site:latest` + `:<sha>` to GHCR, then hits `COOLIFY_WEBHOOK_URL` (repo variable) with `COOLIFY_TOKEN` (secret). `workflow_dispatch` input `try_tag` picks which `kerniva-try-web` tag to bundle.
- `nginx.conf` is the origin's security edge: security headers + CSP declared once via maps (server-level `add_header` is dropped in any location that adds its own — keep it that way), `www` → apex redirect, `X-Robots-Tag: noindex` on `/try*`, origin rate limits keyed on `CF-Connecting-IP` (`try_mint` 10/min for `POST /try/api/v1/sandbox`, `try_api` 4 r/s with bursts), and a 403 for empty/scripted/AI-crawler user agents on `/try/api/`. Proxy settings live in `kerniva-proxy.inc`.
- CSP allows only self, Google Fonts, inline styles, and `data:`/`blob:` images. Adding any external script, image, or fetch target means editing the CSP in **both** `nginx.conf` and `infra/opentofu/main.tf`.
- Cloudflare configuration (DNS proxied, Full-strict TLS, WAF + Bot Fight Mode, rate-limit rules, cache rules, firewall allowing only Cloudflare IPs to the origin) is documented in `../kerniva/infra/coolify/README.md` §3 — it is manual, not in code.

`infra/opentofu` + `.github/workflows/deploy.yml` are the **future AWS path** (S3 + CloudFront + ACM + Route 53). They are kept current but not auto-triggered; `deploy.yml` is manual-only until the migration.

## Sandbox guardrails and budget (enforced server-side in the monorepo)

The site cannot weaken these; it only surfaces them. Defaults, all overridable via Coolify env (`SANDBOX_*`): per sandbox 40 model turns · 200k tokens · 3 uploads ≤ 10 MiB · 120-min sliding TTL; per day 1,500 turns · 6M tokens · 300 sandboxes; 10 new sandboxes per IP per hour. When the daily budget is gone new sandboxes open read-only; when a sandbox's budget is gone the turn ends with a visible message and Library/Cockpit/Relay keep working. Contract: `../kerniva/packages/contracts/src/sandbox.ts`; enforcement: `services/api/src/sandbox.ts`, `sandbox-quota.ts`. Model egress goes through the Cloud Run AI proxy with a revocable `sim` token and a GCP billing alert as the last backstop. Nightly `golden-reset.sh` at 03:00 UTC wipes everything.

`src/pages/privacy.tsx` and the home-page sandbox section state these promises in prose (`SANDBOX_PROMISE` in the contract is the canonical wording). If caps or the TTL change, update that copy.

## Bot and scraper posture

Layers, outermost first: Cloudflare WAF/Bot Fight Mode and rate-limit rules → nginx UA gate + `limit_req` + `X-Robots-Tag` → API per-IP minting cap and budgets. `public/robots.txt` allows the marketing pages, disallows `/try` and `/demo`, and denies the named AI training/answer-engine crawlers entirely. Keep the crawler list in `robots.txt` and the `$kerniva_blocked_ua` map in `nginx.conf` in step when adding one.

## Site conventions

- Single-page app, routes in `src/app.tsx`, all under `components/site-layout.tsx` (footer hidden on `/demo`). Each page sets `document.title` through `PageHeader` or an effect.
- `src/styles.css` is the whole design system: white surfaces, dark ink, Inter; brand gradient `#532671 → #1a1f4d` (from `public/kerniva-gradient.svg`) only for the mark, primary buttons, `.gradient-text`, and `.rule`. Keep new pages on white — no gradient backgrounds behind text; tone is sober and enterprise.
- Contact form only flips local state; the backend endpoint is still a TODO in `src/pages/contact.tsx`.
