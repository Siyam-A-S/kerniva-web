import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const SITE_ORIGIN = "https://kerniva.app";

/**
 * Every page meant to be found by search. This list is the one source for
 * three things that must agree: the canonical tag below, `public/sitemap.xml`
 * (a test compares them), and what gets marked noindex. Redirects (/waitlist,
 * /try, /live) and the not-found page are deliberately absent.
 */
export const PUBLIC_PATHS = [
  "/",
  "/product",
  "/solutions",
  "/research",
  "/security",
  "/pricing",
  "/about",
  "/contact",
  "/demo",
  "/privacy",
] as const;

/** The canonical URL for a path, or null when the path is not a public page. */
export function canonicalFor(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (!(PUBLIC_PATHS as readonly string[]).includes(path)) return null;
  return path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

function upsert(selector: string, create: () => HTMLElement): HTMLElement {
  const found = document.head.querySelector<HTMLElement>(selector);
  if (found) return found;
  const made = create();
  document.head.appendChild(made);
  return made;
}

/**
 * Keeps the canonical tag and the robots tag in step with the route.
 *
 * `index.html` is one file served for every path, so a canonical written
 * there would tell a search engine that every page is a copy of the home
 * page, and none of them would be indexed on its own. It is set here instead,
 * and only here: a canonical in the HTML that script later contradicts is
 * exactly what search engines say not to do.
 *
 * A path that is not a public page gets `noindex`. nginx answers every
 * unknown path with the app shell and a 200, so without this a mistyped URL
 * looks like a real, thin page.
 */
export function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const canonical = canonicalFor(pathname);
    const robots = document.head.querySelector('meta[name="robots"]');

    if (canonical === null) {
      document.head.querySelector('link[rel="canonical"]')?.remove();
      const meta = upsert('meta[name="robots"]', () => {
        const m = document.createElement("meta");
        m.setAttribute("name", "robots");
        return m;
      });
      meta.setAttribute("content", "noindex");
      return;
    }

    robots?.remove();
    const link = upsert('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.setAttribute("rel", "canonical");
      return l;
    });
    link.setAttribute("href", canonical);
  }, [pathname]);

  return null;
}
