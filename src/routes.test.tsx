import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { App } from "./app";

const routes = [
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
  "/nope",
];

describe("every route renders", () => {
  for (const route of routes) {
    it(route, () => {
      const html = renderToString(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );
      expect(html.length).toBeGreaterThan(200);
    });
  }
});

it("the demo route is the booking form and points at the live workspace", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/demo"]}>
      <App />
    </MemoryRouter>,
  );
  expect(html).toContain("Demo request");
  expect(html).toContain('href="https://live.kerniva.app"');
});

// Old links: the waitlist is gone, and both used to render it.
describe("retired routes send visitors to the demo page", () => {
  for (const route of ["/waitlist", "/try"]) {
    it(route, () => {
      const html = renderToString(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );
      // A redirect renders nothing on the server; in the browser it lands on
      // /demo. What must not happen is the not-found page.
      expect(html).not.toContain("Join the waitlist");
      expect(html).not.toContain("404");
    });
  }
});

it("nothing on the home page offers a waitlist", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>,
  );
  expect(html.toLowerCase()).not.toContain("waitlist");
  expect(html).toContain('href="https://live.kerniva.app"');
});

describe("the privacy page", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/privacy"]}>
      <App />
    </MemoryRouter>,
  );

  it("covers this site and points at the live demo's own notice", () => {
    expect(html).toContain('href="https://live.kerniva.app/privacy"');
    expect(html).toContain('href="https://live.kerniva.app/terms"');
    expect(html).toContain('href="mailto:privacy@kerniva.app"');
  });

  // The page used to describe a sandbox that no longer exists, on the wrong
  // cloud and the wrong model provider. None of that may come back.
  it.each(["sandbox", "simulation", "Vertex", "Gemini", "AWS", "03:00"])(
    "no longer mentions %s",
    (word) => {
      expect(html).not.toContain(word);
    },
  );
});

// The product has no zero-retention agreement with its AI providers, and its
// Privacy Notice says so. Only the privacy page may use the phrase, and only
// to say that.
describe("no page claims zero retention", () => {
  for (const route of routes.filter((r) => r !== "/privacy")) {
    it(route, () => {
      const html = renderToString(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );
      expect(html.toLowerCase()).not.toMatch(/zero[- ]retention/);
    });
  }

  it("the privacy page says there is no such agreement", () => {
    const html = renderToString(
      <MemoryRouter initialEntries={["/privacy"]}>
        <App />
      </MemoryRouter>,
    );
    expect(html).toContain("We do not have a zero-retention agreement");
  });
});

// The product moved from AWS to Azure. The copy must not describe the old
// stack anywhere. (The AWS partner mark in the backer strip is a different
// kind of statement and is not what this checks.)
describe("no page describes the product as running on AWS", () => {
  const OLD_STACK =
    /Cognito|CloudFront|ECS Fargate|Secrets Manager|AWS (account|region)|on AWS|hosted AWS/;
  for (const route of routes) {
    it(route, () => {
      const html = renderToString(
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>,
      );
      expect(html).not.toMatch(OLD_STACK);
    });
  }
});
