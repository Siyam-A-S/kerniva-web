# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Marketing site for kerniva.app. The public **"Try Kerniva" simulation is parked behind a waitlist for now**: the `/try` hosting was removed from this repo (see git history at `ec6f2df` to restore it) and every simulation entry point renders the waitlist instead. `/demo` is **not** a simulation: it is the Book a Demo request page. Sibling of the product monorepo at `../kerniva` (GitHub `Siyam-A-S/kerniva`); read its `CLAUDE.md`/`AGENTS.md` for product concepts (Relay, Library, proposals, Cockpit, sensitivity tiers, event-log-is-truth) and keep copy consistent with them.

## Commands

```bash
pnpm install
pnpm dev            # Vite on :4180 (KERNIVA_SITE_PORT overrides)
pnpm check          # tsc -b, the only lint
pnpm test           # vitest; `src/routes.test.tsx` renders every route server-side
pnpm build          # tsc -b && vite build → dist/
pnpm format         # prettier (CI runs format:check)
```

Toolchain pinned in `mise.toml` (Node 24, pnpm 10.14.0). `node` is not on PATH without mise: `mise exec -- pnpm …` or prepend `~/.local/share/mise/installs/node/24/bin`. There is no `docker` here, so use `podman` (e.g. to validate nginx: `podman run --rm -v $PWD/nginx.conf:/etc/nginx/conf.d/default.conf:ro --entrypoint sh docker.io/library/nginx:1.27-alpine -c 'nginx -t'`).

## Waitlist mode (current) and the two "demos"

Primary CTAs are split between `/demo` (Book a Demo, `src/pages/demo.tsx`) and `/waitlist` (`src/pages/waitlist.tsx` + `components/waitlist-form.tsx`). All three forms (contact, waitlist, demo request) flip local state only; their endpoints are TODOs. The SPA route `/try` renders the waitlist page so old links land well. The hero's "Try it now" and the "Watch it work" button under the How it works steps both open the one video modal (`components/video-modal.tsx`), not the sandbox. The closing CTA's second button still points at `/waitlist`.

**The launch film.** The handoff shipped no mp4 (its reference points at an `uploads/` folder that was never included); the file in `public/` was supplied separately. `VideoModal` reads two constants: `LAUNCH_FILM = "/launch-film.mp4"` (present: 18 MB, H.264 720p60 + AAC stereo, 45s, faststart) and `LAUNCH_FILM_POSTER = "/launch-film-poster.jpg"` (not present; harmless, the player falls back to its own first frame). The master lives in `media-src/` (gitignored) and is transcoded into `public/`: **never put a video master in `public/`**, Vite copies that directory verbatim and it would ship. Encode with `-movflags +faststart` so playback starts before the download finishes, and keep it small: Coolify rebuilds the image from this repo on every push to `main`, so the film's weight lands on every deploy. `nginx.conf` caches media for a week by extension; the name is unhashed, so rename the file to bust it. The two simulations, both currently unreachable by design:

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

- **`src/content.tsx` holds every piece of user-visible prose on the site.** Edit copy there, not in the components. Three things stay out of it by design: the header and footer link tables (label plus href routing tables rendered by three different link components), the partner marks in `components/backers.tsx` (inline SVG live text, and one glyph per brand colour for Google, so the copy is fused to styling), and `aria-label` / `alt` / `role` strings, which belong next to the element they describe. Two rules when touching it. The literal arrays are `as const` because several consumers branch on a field only one element has (`"solid" in step`, `"active" in item`, `"src" in tool`); annotating those as optional instead turns the `in` checks into dead code. And where the landing page and a standalone page say the same thing, one const is shared by both (the Research lede, `INTEGRITY`, `ARTIFACTS`, `COMPANY_WHERE`), so editing it changes both surfaces; where the wording already differs, usually a trailing period on the page title, the two are deliberately kept apart. `HOME_TYPE_PHRASES` must stay a module-level binding: `useTypewriter` restarts its effect if the array identity changes, so never spread or map it at the call site. The tagline also lives in `index.html`'s `<title>` and og tags, which the module cannot reach.
- Single-page app, routes in `src/app.tsx`. Everything sits under `components/site-layout.tsx` except `/demo`, which carries its own stripped bar and footer by design. Each page sets `document.title` through `PageHeader` or an effect.
- `src/styles.css` is the whole design system, ported from the "Industry" blueprint handoff: ground `#f2f2f3`, ink `#2e1157`, accent `#5b0077` (hover `#6e2387`, pressed `#4d0064`), a navy secondary ramp to `#0a1b4d`, hairline dividers at 18% navy. **Radius 0 everywhere.** The signature object is `.blueprint`: a 1px frame with four "+" registration crosses overhanging the corners, rendered by `components/blueprint.tsx`. Type is Barlow Condensed 600 uppercase for headings over Barlow for body. The only inverted surfaces are the primary button and the solid step marker (`.step-num--solid`); no gradients, no white cards. `public/kerniva-gradient.svg` and `kerniva-tile.svg` keep the original `#532671 → #1a1f4d` gradient, which now appears only in the mark itself.
- Animation is split on purpose. **Orchestration** uses `motion/react` (the `motion` package): the entrance choreography, scroll reveal (`whileInView`, once), the cycling highlights, and the demo form's enter/exit. Shared curves and the cycle colours live in `components/transitions.ts`; import from there rather than retyping an easing. **Always-on decorative loops** (marquee, dashed hero lines, pulse, float, caret blink) stay as `kv-*` CSS keyframes in `styles.css`, because they run for as long as the page is open and belong on the compositor, not in rAF. Do not migrate those to Motion.
- `layout` is used deliberately, not by default: on the three form plates (demo, contact, waitlist) so the frame resizes with its contents instead of snapping when the fields give way to the confirmation. Two rules follow from it. A parent mid-layout-animation is **scaled**, so every direct child needs `layout` too or it visibly squashes; that is why the demo plate's title bar and status row carry it. And `Corners` takes an `animated` prop for the same reason: pass it only inside a frame that has `layout`, since `layout` costs a measure on every render and there are a dozen frames on the site.
- `AnimatePresence` always sits **outside** the condition that mounts its child. Inside it, it unmounts along with the child and the exit animation silently never runs. Both places this matters are the drop panel in `site-header.tsx` and the form swaps.
- The mobile nav is a separate element (`.site-nav-panel`), not an `.open` state on the desktop row, because AnimatePresence needs something it can mount and unmount. Its padding lives on an inner div so the outer box can animate `height` to zero. It closes on Escape, on a pointer-down outside the header, on navigation, and when the viewport passes the 1080px breakpoint that hides the toggle.
- The FAQ rows are `components/disclosure.tsx`, not `<details>`. The native element collapses its own content, leaving no height for Motion to animate, so the button + `role="region"` pattern carries the semantics explicitly. Keep `aria-expanded` and `aria-controls` wired if you touch it.
- Reduced motion is gated twice, because neither mechanism reaches the other: `<MotionConfig reducedMotion="user">` in `main.tsx` covers Motion's inline styles, and the `prefers-reduced-motion` block in `styles.css` kills the CSS loops.
- `components/anim.tsx` holds the two effects Motion does not help with: `useAutoCycle` (a self-advancing index; **not** Motion's own `useCycle`, which is a manual [state, cycle] pair) and `useTypewriter`. It is named `anim`, not `motion`, so it cannot be confused with the package.
- Both marquees (the integrations tiles and the backer strip) put their gap on **each item** as `margin-left`/`margin-right`, never as `gap` on the track. `kv-marquee` shifts the track by `translateX(-50%)`, which only equals exactly one set width if every item's box carries its own trailing space; with `gap` on the track the loop lands half a gap short and visibly jumps once per cycle.
- Partner marks in the backer strip (`components/backers.tsx`) are inline SVG and live text, never images: no request, no grayscale filter, crisp at any density. Tool logos in the integrations marquee are **vendored** into `public/logos/` rather than pulled from `cdn.simpleicons.org`, so the CSP stays as tight as it is. Adding an external image or script means editing the CSP in both `nginx.conf` and `infra/opentofu/main.tf`.
- The landing page's nav entries are anchors into its own sections (`#product`, `#how`, `#research`, `#security`, `#company`, `#faq`); `components/section-link.tsx` renders a plain anchor on `/` and a router link elsewhere. The standalone routes (`/product`, `/research`, `/security`, `/about`, ...) still exist and stay reachable from the footer.
- All three forms flip local state only; the backend endpoints are still TODOs (`src/pages/contact.tsx`, `src/components/waitlist-form.tsx`, `src/pages/demo.tsx`).
