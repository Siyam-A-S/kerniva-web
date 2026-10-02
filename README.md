# Kerniva website

Marketing site for [kerniva.app](https://kerniva.app). Vite + React 19 + TypeScript, served by nginx, with a small Node API (`api/`) that validates the site's three forms and mails them to the team.

```bash
mise install          # node 24, pnpm 10.14, opentofu
pnpm install
pnpm dev              # http://localhost:4180
pnpm check && pnpm test && pnpm build

cd api && pnpm install && pnpm build && pnpm start   # the forms API, on 127.0.0.1:8080
```

Pages: `/`, `/product`, `/solutions`, `/research`, `/security`, `/pricing`, `/about`, `/contact`, `/privacy`, `/waitlist`, and `/demo`, which is the Book a Demo request form. `/try` renders the waitlist so old links still land somewhere. A scripted, client-only preview of the workspace is kept compiling in `src/demo/` but is not routed.

Hosting: **Azure Container Apps behind Cloudflare.** One container runs nginx (the site, security headers, CSP) with the forms API beside it on loopback. `infra/opentofu` defines the Azure resources and its README is the runbook; `.github/workflows/deploy-site.yml` builds the image and rolls the app after CI passes on `main`. The move from the previous Coolify host is in progress: see the hosting section of `CLAUDE.md` for which one is serving production.

Mail goes out through Google Workspace SMTP. `api/.env.example` lists every variable the API reads.
