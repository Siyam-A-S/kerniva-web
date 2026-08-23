# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing site + product simulation for kerniva.app. Sibling of the product monorepo at `../kerniva` (read its `CLAUDE.md`/`AGENTS.md` for product concepts: Relay, Library, proposals, Cockpit, sensitivity tiers, the event-log-is-truth rule). Keep copy and the simulation consistent with that product.

## Commands

```bash
pnpm install
pnpm dev            # Vite on :4180 (override with KERNIVA_SITE_PORT)
pnpm check          # tsc -b, the only lint
pnpm test           # vitest (none yet); single test: pnpm vitest run <file>
pnpm build          # tsc -b && vite build → dist/
pnpm format         # prettier
```

Toolchain is pinned in `mise.toml` (Node 24, pnpm 10.14.0, OpenTofu). `node` is not on PATH without mise: use `mise exec -- pnpm …` or `~/.local/share/mise/installs/node/24/bin`.

## Architecture

- Single-page app with `react-router-dom`; routes are declared in `src/app.tsx`, all wrapped by `components/site-layout.tsx` (header/footer; footer hidden on `/demo`). Every page sets `document.title` via `PageHeader` or an effect.
- `src/styles.css` is the whole design system: white surfaces, dark ink, the brand gradient (`#532671 → #1a1f4d`, from `public/kerniva-gradient.svg`) used only for the mark, primary buttons, and rules. Keep new pages on white — no gradient backgrounds behind text. The `.sim*` section mirrors the product's light enterprise theme.
- `/demo` is a client-only simulation: `src/demo/model.ts` holds the data model and a scripted, keyword-matched "agent" (`runAgent`) that returns a reply plus an optional proposal; `demo-page.tsx` is a reducer where every action appends to the project event log and views are derived from state. Preserve the product rule there: agents propose, only the driver approves, artifacts appear only after approval, assets above the project's max tier are excluded from context.
- Hosting is static: `infra/opentofu` (private S3 + CloudFront OAC + ACM + Route 53; a CloudFront Function does the SPA rewrite and www redirect, and a response-headers policy sets the CSP). The CSP allows only self, Google Fonts, and inline styles — if you add external scripts or images, update the policy in `main.tf`. `.github/workflows/deploy.yml` syncs `dist/` and invalidates.
- Contact form currently only flips local state; the backend endpoint is a TODO in `src/pages/contact.tsx`.

## Live simulation (`/try`)

- `/try` is **not** a React route: nginx serves the real Kerniva sandbox build there (`Dockerfile` COPYs it from `ghcr.io/<owner>/kerniva-try-web`). Link to it with a plain `<a href="/try">`, never `<Link>`. `/demo` stays the scripted preview.
- CSP lives in `nginx.conf` now (and still in `main.tf` for the AWS rollback) — change both if you add an external origin.
- Every promise the site makes about the sandbox (two-hour TTL, nightly wipe, uploads deleted, no analytics) is enforced by the product repo's `infra/coolify` stack; do not promise more than it does.
