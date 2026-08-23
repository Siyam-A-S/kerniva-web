import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Logo } from "./logo";

const links = [
  ["/product", "Product"],
  ["/solutions", "Solutions"],
  ["/research", "Research"],
  ["/security", "Security"],
  ["/pricing", "Pricing"],
  ["/about", "Company"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />
        <nav className={`nav${open ? " open" : ""}`} onClick={() => setOpen(false)}>
          {links.map(([to, label]) => (
            <NavLink key={to} to={to}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link to="/contact" className="btn btn--secondary btn--sm">
            Talk to sales
          </Link>
          <a href="/try" className="btn btn--primary btn--sm">
            Try the workspace
          </a>
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
