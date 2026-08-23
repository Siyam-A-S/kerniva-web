import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

export function SiteLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  const isDemo = pathname.startsWith("/demo");
  return (
    <>
      <SiteHeader />
      <main>
        <Outlet />
      </main>
      {!isDemo && <SiteFooter />}
    </>
  );
}
