# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing site for kerniva.app. The product itself runs on its own origin, `https://live.kerniva.app` (repo `../kerniva-prod`), and this site's job is to send people there: they book a demo here, then sign up there with the same email for a fresh workspace. There is no waitlist and no access code on this site. `/demo` is **not** a simulation: it is the Book a Demo request page. Read `../kerniva-prod`'s `CLAUDE.md`/`AGENTS.md` for product concepts (Relay, Library, proposals, Cockpit, sensitivity tiers, event-log-is-truth) and keep copy consistent with them.

## Commands

```bash
pnpm install
pnpm dev            # Vite on :4180 (KERNIVA_SITE_PORT overrides)
pnpm check          # tsc -b, the only lint
pnpm test           # vitest; `src/routes.test.tsx` renders every route server-side
pnpm build          # tsc -b && vite build → dist/
pnpm format         # prettier (CI runs format:check)

cd api && pnpm build   # tsc, compiles the forms API to api/dist (tests excluded)
cd api && pnpm check   # type-checks the API, tests included
cd api && pnpm test    # the API's own vitest (root `pnpm test` also picks these up)
```

Toolchain pinned in `mise.toml` (Node 24, pnpm 10.14.0). `node` is not on PATH without mise: `mise exec -- pnpm …` or prepend `~/.local/share/mise/installs/node/24/bin`. There is no `docker` here, so use `podman` (e.g. to validate nginx: `podman run --rm -v $PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro --entrypoint sh docker.io/library/nginx:1.27-alpine -c 'nginx -t'`).

## Getting people into the product

The one conversion path is `/demo` (Book a Demo, `src/pages/demo.tsx`) followed by sign-up on the product's own origin. The form mails the request to the team; it does not create an account, issue a code, or talk to the product. What it promises is in `DEMO_PAGE` and in the demo confirmation email (`shared/confirmation.ts`): sign up at `live.kerniva.app` with the same email. How sign-up works there is `../kerniva-prod`'s business; do not describe its mechanics here beyond what that product actually does.

- **Every link to the product is a plain `<a href={LIVE_URL}>`, never a router `<Link>`**: it is another origin. `LIVE_URL` and `LIVE_HOST` live in `src/content.tsx`. The header and footer "Sign in", the "Open your workspace" buttons, and the demo page's confirmation all use it.
- `/live` and `/live/` are answered by nginx with a 302 to `https://live.kerniva.app/`, before the SPA. It is the short address to hand out.
- `/waitlist` and `/try` are old links. They redirect to `/demo` inside the SPA. The waitlist page, its form, and the `waitlist` form kind in `shared/forms.ts` were removed together, so the API no longer accepts that endpoint.
- The two forms left are contact and demo request. Both post to the forms API described below.
- The hero's "See how it works" scrolls to the How it works section, and the "Watch it work" button under its steps opens the video modal (`components/video-modal.tsx`).

**The launch film.** The handoff shipped no mp4 (its reference points at an `uploads/` folder that was never included); the file in `public/` was supplied separately. `VideoModal` reads two constants: `LAUNCH_FILM = "/launch-film.mp4"` (present: 18 MB, H.264 720p60 + AAC stereo, 45s, faststart) and `LAUNCH_FILM_POSTER = "/launch-film-poster.jpg"` (not present; harmless, the player falls back to its own first frame). The master lives in `media-src/` (gitignored) and is transcoded into `public/`: **never put a video master in `public/`**, Vite copies that directory verbatim and it would ship. Encode with `-movflags +faststart` so playback starts before the download finishes, and keep it small: the image is rebuilt and pushed on every merge to `main`, so the film's weight lands on every deploy. `nginx.conf` caches media for a week by extension; the name is unhashed, so rename the file to bust it. Two older simulations remain in history or unrouted, and neither is the live product:

- **`/try`**: the real thing: a full Kerniva stack in sandbox mode built from the monorepo's `try-kerniva-simulation` branch (images `kerniva-api`/`kerniva-worker`/`kerniva-try-web`, compose in `../kerniva/infra/coolify/`). When re-enabling it, restore the nginx proxy + rate limits, `kerniva-proxy.inc`, the Dockerfile `TRY_IMAGE` stage, and the workflow `try_tag` input from commit `ec6f2df`, and switch CTAs back to plain `<a href="/try">` (not `<Link>`, because nginx must intercept before the SPA).
- **`src/demo/`**: the scripted, client-only preview (`model.ts` = data model + keyword-matched agent, `demo-page.tsx` = reducer where every action appends to a project event log). Currently not routed but kept compiling. Preserve the product rule there: agents propose, only the driver approves, artifacts appear only after approval, assets above the project's max tier are excluded from context.

## The forms API

`api/` is a small Node service that validates a form submission and mails it to
the team. It listens on loopback inside the site container and nginx proxies
`/api/` to it, so the browser only ever sees one origin and the CSP needs no
`connect-src` exception. That is the main reason it is not a separate service:
a second origin would mean editing the CSP in two files and enabling CORS.

- **`shared/forms.ts` is the wire contract**, imported by both the browser and
  the API so validation cannot drift. Field names, length caps, the allowed
  values for every select, and the routing table live there. `src/content.tsx`
  re-exports the addresses and pairs the values with labels; only labels are
  copy.
- **Never iterate the request body into an email.** The server reads only the
  fields `FORM_FIELDS` declares. Anything reaching a mail header goes through
  `headerSafe`, which collapses line breaks: without it a crafted name injects
  extra headers and the form becomes an open relay.
- **`From` is always our own address**, with the visitor in `Reply-To`. Sending
  as the visitor fails SPF and DMARC.
- Guardrails, in the order they run: nginx `limit_req` and an 8k body cap, then
  in-app per-IP sliding windows (10/min, 30/hour), Origin check, a required
  `application/json` content type (which a cross-site form cannot send without
  a preflight this server refuses), an HMAC-signed form token that must be at
  least three seconds old, a honeypot field, and a daily send cap that bounds
  the damage if the rest fail. A token is single use: it is claimed once every
  other check has passed and handed back if the send fails, so a typo or a mail
  outage does not cost the visitor a reload. Cloudflare Turnstile is the
  documented next step and would need `challenges.cloudflare.com` in the CSP in
  `nginx.conf`.
- **The acknowledgement to the visitor is fixed copy and nothing else.**
  `CONFIRMATION_ENABLED=true` sends a short note after a submission is
  delivered to the team. The address on a form is unverified, so the message
  must be useless to someone aiming it at a stranger: subject and body come
  whole from `shared/confirmation.ts`, and nothing the visitor typed is placed
  in it, not even their name. One per address per day, a daily ceiling of its
  own below the overall one, sent only after the team mail succeeds, never
  awaited, and its failure never changes the response. It is a no-reply
  notice: no `Reply-To`, and the body names `contact@kerniva.app` instead. The
  mail to the team keeps the visitor in `Reply-To`, which is how the team
  answers them. The form's on-screen
  confirmation must not promise an email, since one may be skipped.
- The API is split so it can be tested without a mail server: `compose.ts`
  builds messages and reads SMTP settings (no mail library), `mail.ts` owns the
  transport, `app.ts` is the request handler with its senders passed in, and
  `index.ts` only wires them to a port. Keep `nodemailer` out of everything but
  `mail.ts`: the root `pnpm test` runs the API tests without the API's
  dependencies installed.
- **Automated mail goes through Azure Communication Services Email**, not a
  person's mailbox (`infra/opentofu/mail.tf`, resource group `rg-kerniva-mail`,
  shared with the product demo). SMTP signs in as an Entra application
  (`kerniva-site-mail`) whose client secret is `SMTP_PASS`; that secret expires
  and must be rotated. `From` must be `noreply@kerniva.app`, the one sender
  registered on the domain. Google Workspace still receives all mail for the
  domain and is what people send from, so the SPF record lists both and must
  stay a single record.
- Configuration is environment only; see `api/.env.example`. With no
  `SMTP_HOST` in production the API still starts, logs loudly, reports
  `mailConfigured:false` on `/api/health`, and refuses submissions with a 503
  naming `contact@kerniva.app`. It must never exit over configuration: it
  shares a container with the nginx serving the site, and an earlier version
  that called `process.exit(1)` here crash-looped the container until the host
  hit its restart limit, 404ing the whole site. An empty `SMTP_HOST` counts as
  unset, because infrastructure code passes empty strings for unfilled values. Only nginx exiting ends the
  container; `docker-entrypoint.sh` restarts the API on its own.
- `FORM_TOKEN_SECRET` should be set explicitly. If it is not, the API generates
  one at boot and every in-flight form token breaks on restart.
- The API binds `FORMS_API_PORT` (default 8080), **not** `PORT`. Hosting
  platforms inject `PORT` to mean "the port to serve on"; Coolify set it to
  the container's exposed port, which made this process fight nginx for `:80`
  and die with `EADDRINUSE` on every restart, so `/api` served 502 while the
  site was fine. The value must match the `proxy_pass` in `nginx.conf`.
- `pnpm dev` proxies `/api` to `127.0.0.1:8080` (`KERNIVA_API_PORT` overrides),
  so run `cd api && pnpm build && pnpm start` alongside it to exercise a form.

## Hosting: Azure Container Apps + Cloudflare

```
Cloudflare (proxied DNS, WAF, rate limits, cache, Full strict TLS)
  └─ Azure Container Apps ingress (Cloudflare Origin CA certificate)
       └─ ca-kerniva-site: this repo's Dockerfile, one replica, port 80
```

- Everything lives in resource group `rg-kerniva-site`, in the same Azure subscription and tenant as the product demo (`rg-kerniva-demo`, repo `../kerniva-prod`) but sharing nothing with it. `infra/opentofu` is the whole of it: environment, registry, identity, log workspace, the app, and the custom domain binding. Its README is the runbook (bootstrap, two-pass first apply, certificate, cutover, rollback). The login that runs it can see a second subscription in another tenant, so the subscription and tenant are required variables with no default and every `az` command names `--subscription`. Never run `tofu` in `../kerniva-prod` from here: its code does not match what is deployed.
- **One replica, always on, and it has to stay that way.** The forms API keeps rate-limit windows, the daily send caps and spent form tokens in memory. A second replica doubles every limit and refuses tokens the first one issued; scale to zero resets the caps on each cold start.
- `.github/workflows/deploy-site.yml` runs after CI succeeds on `main`: builds the image, pushes it to the site's registry tagged `sha-<commit>` (never `latest`), and rolls the app with `az containerapp update`. It signs in through GitHub OIDC as the Entra app `gha-kerniva-site-deploy`, whose federated credential trusts only the `site` environment, so there is no stored Azure secret. OpenTofu ignores the image after creation; the pipeline owns it. (The Entra app named `kerniva-web` is the product's sign-in registration, not this repo.)
- `.github/workflows/security.yml` audits the shipped dependencies of both packages (`pnpm audit --prod --audit-level high`) and scans the whole git history for secrets with gitleaks, on every push, pull request, and weekly. It is deliberately **not** part of CI: the deploy is gated on CI, and an advisory published overnight must not block an unrelated fix. A red Security run is still a to-do, not noise. `.github/dependabot.yml` opens grouped weekly update PRs for both packages, the actions, and the Docker base images; GitHub secret scanning with push protection is on for the repository, which is public.
- `Dockerfile`: builds the site and the forms API, then ships `dist/` in `nginx:1.27-alpine` with `nginx.conf` and runs the API alongside it on loopback. `docker-entrypoint.sh` supervises both: the API is restarted when it dies, and only nginx exiting ends the container. No simulation bundle.
- `nginx.conf`: security headers + CSP declared once via maps (server-level `add_header` is dropped in any location that adds its own, so keep it that way), `www` → apex redirect, an https bounce keyed on Cloudflare's `CF-Visitor` header (the platform ingress always delivers plain HTTP to the container), `/healthz` for the platform's probes, 404 for dotfiles (with `/.well-known/security.txt` carved out), SPA fallback. `.dockerignore` keeps `.git`/`node_modules`/`infra` out of the build context.
- **Probes ask nginx at `/healthz`, never `/api/health`.** A probe that depended on the forms API would have the platform kill the site whenever mail is misconfigured, which is the exact failure the entrypoint is built to avoid.
- **Cloudflare stays in front, and nginx depends on it.** Rate limiting keys on `CF-Connecting-IP` and the https bounce on `CF-Visitor`. Those headers are only trustworthy because the Container App's ingress admits Cloudflare's address ranges and nothing else (`ingress_allowed_cidrs`); a caller reaching the origin directly could set them to anything. The origin certificate is a Cloudflare Origin CA certificate uploaded by CLI, not an Azure managed certificate, which cannot validate or renew through a proxied record.
- `www.kerniva.app` is **not live**: it has no DNS record, so the `www` redirect in `nginx.conf` never gets reached. Apex stays canonical (`og:url`, `<link rel="canonical">`, `sitemap.xml`). If it is ever wanted, a Cloudflare redirect rule on a proxied `www` record is simpler than a second hostname binding.
- `og:image` must stay a **PNG** (`public/og-image.png`, 1200×630). LinkedIn, Slack, and X all silently drop SVG og:images, which is what made link previews render blank. Regenerate it rather than swapping in an SVG.
- CSP allows only self, Google Fonts, inline styles, and `data:`/`blob:` images. It is declared in one place, `nginx.conf`; adding any external script, image, or fetch target means editing it there.
- HSTS is sent with `includeSubDomains; preload`, so every subdomain of kerniva.app must serve valid HTTPS before anything links to it. That includes `live.kerniva.app`, the product demo.
- Cloudflare configuration (DNS proxied, Full-strict TLS, WAF + Bot Fight Mode, rate-limit rules, cache rules) is manual, not in code.

## Sandbox guardrails and budget (for when /try returns)

Enforced server-side in the monorepo; the site only surfaces them. Defaults via environment (`SANDBOX_*`): per sandbox 40 model turns · 200k tokens · 3 uploads ≤ 10 MiB · 120-min sliding TTL; per day 1,500 turns · 6M tokens · 300 sandboxes; 10 new sandboxes per IP per hour. Contract: `../kerniva/packages/contracts/src/sandbox.ts` (`SANDBOX_PROMISE` is the canonical data-handling wording; `src/pages/privacy.tsx` states it in prose; keep them in step).

## Bot and scraper posture

Cloudflare WAF/Bot Fight Mode in front; `public/robots.txt` allows the marketing pages and denies the named AI training/answer-engine crawlers entirely. When `/try` returns, also restore the nginx UA gate + `limit_req` layer from `ec6f2df`.

## Site conventions

- **No em dashes anywhere in this repo**, in site copy, comments, or docs. Use a colon, semicolon, comma, or parentheses instead. `.feature-list` bullets are drawn in CSS as a rule, not typed as a character.

- **`src/content.tsx` holds every piece of user-visible prose on the site.** Edit copy there, not in the components. The one piece of prose that cannot live there is the confirmation email in `shared/confirmation.ts`, because the forms API cannot import a React module. Three things on the site itself stay out of it by design: the header and footer link tables (label plus href routing tables rendered by three different link components), the partner marks in `components/backers.tsx` (inline SVG live text, and one glyph per brand colour for Google, so the copy is fused to styling), and `aria-label` / `alt` / `role` strings, which belong next to the element they describe. Two rules when touching it. The literal arrays are `as const` because several consumers branch on a field only one element has (`"solid" in step`, `"active" in item`, `"src" in tool`); annotating those as optional instead turns the `in` checks into dead code. And where the landing page and a standalone page say the same thing, one const is shared by both (the Research lede, `INTEGRITY`, `ARTIFACTS`, `COMPANY_WHERE`), so editing it changes both surfaces; where the wording already differs, usually a trailing period on the page title, the two are deliberately kept apart. `HOME_TYPE_PHRASES` must stay a module-level binding: `useTypewriter` restarts its effect if the array identity changes, so never spread or map it at the call site. The tagline also lives in `index.html`'s `<title>` and og tags, which the module cannot reach.
- Single-page app, routes in `src/app.tsx`. Everything sits under `components/site-layout.tsx` except `/demo`, which carries its own stripped bar and footer by design. Each page sets `document.title` through `PageHeader` or an effect.
- `src/styles.css` is the whole design system, ported from the "Industry" blueprint handoff: ground `#f2f2f3`, ink `#2e1157`, accent `#5b0077` (hover `#6e2387`, pressed `#4d0064`), a navy secondary ramp to `#0a1b4d`, hairline dividers at 18% navy. **Radius 0 everywhere.** The signature object is `.blueprint`: a 1px frame with four "+" registration crosses overhanging the corners, rendered by `components/blueprint.tsx`. Type is Barlow Condensed 600 uppercase for headings over Barlow for body. The only inverted surfaces are the primary button and the solid step marker (`.step-num--solid`); no gradients, no white cards. `public/kerniva-gradient.svg` and `kerniva-tile.svg` keep the original `#532671 → #1a1f4d` gradient, which now appears only in the mark itself.
- Animation is split on purpose. **Orchestration** uses `motion/react` (the `motion` package): the entrance choreography, scroll reveal (`whileInView`, once), the cycling highlights, and the demo form's enter/exit. Shared curves and the cycle colours live in `components/transitions.ts`; import from there rather than retyping an easing. **Always-on decorative loops** (marquee, dashed hero lines, pulse, float, caret blink) stay as `kv-*` CSS keyframes in `styles.css`, because they run for as long as the page is open and belong on the compositor, not in rAF. Do not migrate those to Motion.
- `layout` is used deliberately, not by default: on the two form plates (demo, contact) so the frame resizes with its contents instead of snapping when the fields give way to the confirmation. Two rules follow from it. A parent mid-layout-animation is **scaled**, so every direct child needs `layout` too or it visibly squashes; that is why the demo plate's title bar and status row carry it. And `Corners` takes an `animated` prop for the same reason: pass it only inside a frame that has `layout`, since `layout` costs a measure on every render and there are a dozen frames on the site.
- `AnimatePresence` always sits **outside** the condition that mounts its child. Inside it, it unmounts along with the child and the exit animation silently never runs. Both places this matters are the drop panel in `site-header.tsx` and the form swaps.
- The mobile nav is a separate element (`.site-nav-panel`), not an `.open` state on the desktop row, because AnimatePresence needs something it can mount and unmount. Its padding lives on an inner div so the outer box can animate `height` to zero. It closes on Escape, on a pointer-down outside the header, on navigation, and when the viewport passes the 1080px breakpoint that hides the toggle.
- The FAQ rows are `components/disclosure.tsx`, not `<details>`. The native element collapses its own content, leaving no height for Motion to animate, so the button + `role="region"` pattern carries the semantics explicitly. Keep `aria-expanded` and `aria-controls` wired if you touch it.
- Reduced motion is gated twice, because neither mechanism reaches the other: `<MotionConfig reducedMotion="user">` in `main.tsx` covers Motion's inline styles, and the `prefers-reduced-motion` block in `styles.css` kills the CSS loops.
- `components/anim.tsx` holds the two effects Motion does not help with: `useAutoCycle` (a self-advancing index; **not** Motion's own `useCycle`, which is a manual [state, cycle] pair) and `useTypewriter`. It is named `anim`, not `motion`, so it cannot be confused with the package.
- Both marquees (the integrations tiles and the backer strip) put their gap on **each item** as `margin-left`/`margin-right`, never as `gap` on the track. `kv-marquee` shifts the track by `translateX(-50%)`, which only equals exactly one set width if every item's box carries its own trailing space; with `gap` on the track the loop lands half a gap short and visibly jumps once per cycle.
- Partner marks in the backer strip (`components/backers.tsx`) are inline SVG and live text, never images: no request, no grayscale filter, crisp at any density. Tool logos in the integrations marquee are **vendored** into `public/logos/` rather than pulled from `cdn.simpleicons.org`, so the CSP stays as tight as it is. Adding an external image or script means editing the CSP in `nginx.conf`.
- The landing page's nav entries are anchors into its own sections (`#product`, `#how`, `#research`, `#security`, `#company`, `#faq`); `components/section-link.tsx` renders a plain anchor on `/` and a router link elsewhere. The standalone routes (`/product`, `/research`, `/security`, `/about`, ...) still exist and stay reachable from the footer.
- Both forms go through `useFormSubmit` in `src/forms/submit.ts`, which owns the token, the honeypot, the in-flight state, and the error path. A failed send must never render as a confirmation.
