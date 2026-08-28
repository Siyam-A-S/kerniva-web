# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing site for kerniva.app. The public **"Try Kerniva" simulation is parked behind a waitlist for now**: the `/try` hosting was removed from this repo (see git history at `ec6f2df` to restore it) and every simulation/demo entry point renders the waitlist instead. Sibling of the product monorepo at `../kerniva` (GitHub `Siyam-A-S/kerniva`); read its `CLAUDE.md`/`AGENTS.md` for product concepts (Relay, Library, proposals, Cockpit, sensitivity tiers, event-log-is-truth) and keep copy consistent with them.

## Commands

```bash
pnpm install
pnpm dev            # Vite on :4180 (KERNIVA_SITE_PORT overrides)
pnpm check          # tsc -b, the only lint
pnpm test           # vitest (none yet); single test: pnpm vitest run <file>
pnpm build          # tsc -b && vite build → dist/
pnpm format         # prettier (CI runs format:check)
```

Toolchain pinned in `mise.toml` (Node 24, pnpm 10.14.0). `node` is not on PATH without mise: `mise exec -- pnpm …` or prepend `~/.local/share/mise/installs/node/24/bin`. There is no `docker` here, so use `podman` (e.g. to validate nginx: `podman run --rm -v $PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro --entrypoint sh docker.io/library/nginx:1.27-alpine -c 'nginx -t'`).

## Waitlist mode (current) and the two "demos"

All primary CTAs point to `/waitlist` (`src/pages/waitlist.tsx` + `components/waitlist-form.tsx`; the form is client-side only; the endpoint is a TODO like the contact form). The SPA routes `/try` and `/demo` also render the waitlist page so old links land well. The two simulations, both currently unreachable by design:

- **`/try`**: the real thing: a full Kerniva stack in sandbox mode built from the monorepo's `try-kerniva-simulation` branch (images `kerniva-api`/`kerniva-worker`/`kerniva-try-web`, compose in `../kerniva/infra/coolify/`). When re-enabling it, restore the nginx proxy + rate limits, `kerniva-proxy.inc`, the Dockerfile `TRY_IMAGE` stage, and the workflow `try_tag` input from commit `ec6f2df`, and switch CTAs back to plain `<a href="/try">` (not `<Link>`, because nginx must intercept before the SPA).
- **`src/demo/`**: the scripted, client-only preview (`model.ts` = data model + keyword-matched agent, `demo-page.tsx` = reducer where every action appends to a project event log). Currently not routed but kept compiling. Preserve the product rule there: agents propose, only the driver approves, artifacts appear only after approval, assets above the project's max tier are excluded from context.

## Hosting (current): Coolify + Cloudflare, build-from-source

```
Cloudflare (proxied DNS, WAF, rate limits, cache)
  └─ Coolify/Traefik on one VM
       └─ application built FROM THIS REPO by Coolify's GitHub App
            (build pack: Dockerfile · port 80 · domain https://kerniva.app)
```

- Deploys are **build-from-source**: the Coolify GitHub App watches this repo and rebuilds the `Dockerfile` on push to `main`, with no registry in the loop. The GitHub App needs Coolify's dashboard reachable by GitHub (instance domain, e.g. `https://coolify.kerniva.app`) or auto-deploy webhooks won't fire.
- `Dockerfile`: builds the site and ships `dist/` in `nginx:1.27-alpine` with `nginx.conf`. Static only: no simulation bundle, no API proxy. Use the Dockerfile build pack (not Static/nixpacks): the nginx config carries the security headers, CSP, and www redirect.
- `.github/workflows/deploy-coolify.yml`: builds and publishes `ghcr.io/siyam-a-s/kerniva-site` on every push to `main`, then notifies Coolify. It is the escape hatch from the broken GitHub App webhook (see the `coolify.kerniva.app` note below) and needs no DNS, since the runner calls Coolify directly. Dormant until repo variable `COOLIFY_WEBHOOK_URL` + secret `COOLIFY_TOKEN` are set and the Coolify application is switched from the Dockerfile build pack to Docker Image. The monorepo's `../kerniva/infra/coolify/docker-compose.yml` still references that image for when the full simulation stack returns.
- `nginx.conf`: security headers + CSP declared once via maps (server-level `add_header` is dropped in any location that adds its own — keep it that way), `www` → apex redirect, an https bounce keyed on Cloudflare's `CF-Visitor` header (Traefik/cloudflared always deliver plain HTTP, so `X-Forwarded-Proto` is meaningless here), 404 for dotfiles (with `/.well-known/security.txt` carved out), SPA fallback. `.dockerignore` keeps `.git`/`node_modules`/`infra` out of the build context.
- `www.kerniva.app` is **not live**: it has no DNS record, so the `www` redirect in `nginx.conf` never gets reached. Serving it needs two manual steps outside this repo: a proxied `www` CNAME to the apex in Cloudflare, and `https://www.kerniva.app` added to the Coolify application's Domains field so Traefik routes that host. Apex stays canonical (`og:url`, `<link rel="canonical">`, `sitemap.xml`); `www` only ever 301s to it. The AWS path in `infra/opentofu/main.tf` already models both (ACM SAN, CloudFront alias, Route 53 record, viewer-request redirect).
- `og:image` must stay a **PNG** (`public/og-image.png`, 1200×630). LinkedIn, Slack, and X all silently drop SVG og:images, which is what made link previews render blank. Regenerate it rather than swapping in an SVG.
- CSP allows only self, Google Fonts, inline styles, and `data:`/`blob:` images. Adding any external script, image, or fetch target means editing the CSP in **both** `nginx.conf` and `infra/opentofu/main.tf`.
- Cloudflare configuration (DNS proxied, Full-strict TLS, WAF + Bot Fight Mode, rate-limit rules, cache rules, firewall allowing only Cloudflare IPs to the origin) is documented in `../kerniva/infra/coolify/README.md` §3; it is manual, not in code.

`infra/opentofu` + `.github/workflows/deploy.yml` are the **future AWS path** (S3 + CloudFront + ACM + Route 53). They are kept current but not auto-triggered; `deploy.yml` is manual-only until the migration.

## Sandbox guardrails and budget (for when /try returns)

Enforced server-side in the monorepo; the site only surfaces them. Defaults via Coolify env (`SANDBOX_*`): per sandbox 40 model turns · 200k tokens · 3 uploads ≤ 10 MiB · 120-min sliding TTL; per day 1,500 turns · 6M tokens · 300 sandboxes; 10 new sandboxes per IP per hour. Contract: `../kerniva/packages/contracts/src/sandbox.ts` (`SANDBOX_PROMISE` is the canonical data-handling wording; `src/pages/privacy.tsx` states it in prose; keep them in step).

## Bot and scraper posture

Cloudflare WAF/Bot Fight Mode in front; `public/robots.txt` allows the marketing pages and denies the named AI training/answer-engine crawlers entirely. When `/try` returns, also restore the nginx UA gate + `limit_req` layer from `ec6f2df`.

## Site conventions

- **No em dashes anywhere in this repo**, in site copy, comments, or docs. Use a colon, semicolon, comma, or parentheses instead. `.feature-list` bullets are drawn in CSS as a rule, not typed as a character.

- Single-page app, routes in `src/app.tsx`, all under `components/site-layout.tsx`. Each page sets `document.title` through `PageHeader` or an effect.
- `src/styles.css` is the whole design system: white surfaces, dark ink, Inter; brand gradient `#532671 → #1a1f4d` (from `public/kerniva-gradient.svg`) for the mark, primary buttons, `.gradient-text`, and `.rule`. Two deliberate brand surfaces carry white text on purple: the sticky `.site-header` (solid `--brand-a`, with inverted nav links and buttons) and `.card--brand`, used once on the first "Built for analysts" card. Everything else stays white; tone is sober and enterprise.
- Contact and waitlist forms only flip local state; the backend endpoints are still TODOs (`src/pages/contact.tsx`, `src/components/waitlist-form.tsx`).
