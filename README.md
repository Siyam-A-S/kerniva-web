# Kerniva website

Marketing site for [kerniva.app](https://kerniva.app). Vite + React 19 + TypeScript. The "Try Kerniva" simulation is behind a waitlist for now; its `/try` packaging lives in git history (`ec6f2df`).

```bash
mise install          # node 24, pnpm 10.14, opentofu
pnpm install
pnpm dev              # http://localhost:4180
pnpm check && pnpm build
```

Pages: `/`, `/product`, `/solutions`, `/research`, `/security`, `/pricing`, `/about`, `/contact`, and `/demo` — a client-side simulation of the workspace (projects, Relay, Library, proposals, artifacts, Cockpit, event log). The simulation has no backend; see `src/demo/model.ts`.

Hosting: **Coolify + Cloudflare** (self-hosted). Coolify's GitHub App builds this repo's `Dockerfile` (site + `nginx.conf`) on push to `main` and serves it at kerniva.app. `.github/workflows/deploy-coolify.yml` is a manual fallback that publishes `ghcr.io/<owner>/kerniva-site`. Cloudflare settings and the parked simulation stack are documented in the product repo at `infra/coolify/README.md`. The AWS path (`infra/opentofu`, `deploy.yml`) is kept as a manual rollback.

Pages also include `/privacy` (what the simulation stores) and the scripted `/demo` preview, kept as the no-backend fallback.
