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
  "/waitlist",
  "/try",
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

it("the demo route is not the waitlist page", () => {
  const html = renderToString(
    <MemoryRouter initialEntries={["/demo"]}>
      <App />
    </MemoryRouter>,
  );
  expect(html).toContain("Demo request");
  expect(html).not.toContain("The live simulation is almost ready");
});
