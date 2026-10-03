import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { App } from "./app";
import { NOT_FOUND } from "./content";
import { PUBLIC_PATHS, SITE_ORIGIN, canonicalFor } from "./seo";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

describe("canonicalFor", () => {
  it("gives each public page its own address", () => {
    expect(canonicalFor("/")).toBe("https://kerniva.app/");
    expect(canonicalFor("/product")).toBe("https://kerniva.app/product");
  });

  it("ignores a trailing slash", () => {
    expect(canonicalFor("/product/")).toBe("https://kerniva.app/product");
  });

  it.each(["/waitlist", "/try", "/live", "/nope", "/product/extra"])(
    "has none for %s, which is not a public page",
    (path) => {
      expect(canonicalFor(path)).toBeNull();
    },
  );
});

describe("sitemap.xml", () => {
  const xml = read("../public/sitemap.xml");
  const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");

  it("lists exactly the public pages, by their canonical address", () => {
    expect(listed).toEqual(PUBLIC_PATHS.map((path) => canonicalFor(path)));
  });

  it("is on the site's own origin only", () => {
    for (const loc of listed) expect(loc.startsWith(`${SITE_ORIGIN}/`)).toBe(true);
  });
});

describe("every page in the sitemap is a real page", () => {
  for (const path of PUBLIC_PATHS) {
    it(path, () => {
      const html = renderToString(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>,
      );
      expect(html.length).toBeGreaterThan(200);
      expect(html).not.toContain(NOT_FOUND.title);
    });
  }
});

describe("crawler files", () => {
  it("robots.txt points at the sitemap and lets ordinary crawlers in", () => {
    const robots = read("../public/robots.txt");
    expect(robots).toContain(`Sitemap: ${SITE_ORIGIN}/sitemap.xml`);
    expect(robots).toMatch(/User-agent: \*\nAllow: \//);
  });

  // One file is served for every path. A canonical in it would mark every
  // page as a copy of the home page.
  it("index.html carries no canonical or robots tag of its own", () => {
    const html = read("../index.html");
    expect(html).not.toMatch(/<link[^>]+rel="canonical"/);
    expect(html).not.toMatch(/<meta[^>]+name="robots"/);
  });
});
