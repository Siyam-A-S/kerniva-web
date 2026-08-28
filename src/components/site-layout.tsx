import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteLayout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // A link into a landing section from another route arrives with the hash
    // already set, so the element has to be found after the route renders.
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    // Jump, do not glide: html has scroll-behavior smooth for in-page anchors,
    // and a route change should not animate the whole document back to the top.
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <>
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
