import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * Links to a section of the landing page. On the landing page itself this is a
 * plain in-page anchor, so the browser does the smooth scroll; from any other
 * route it is a router link that lands on "/" with the hash, which
 * site-layout.tsx then scrolls to.
 */
export function SectionLink({
  hash,
  className,
  children,
  onClick,
}: {
  hash: string;
  className?: string;
  children: ReactNode;
  onClick?: (() => void) | undefined;
}) {
  const { pathname } = useLocation();
  if (pathname === "/") {
    return (
      <a href={`#${hash}`} className={className} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <Link to={`/#${hash}`} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
