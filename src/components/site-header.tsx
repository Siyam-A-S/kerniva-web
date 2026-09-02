import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion, spring } from "motion/react";
import { Logo } from "./logo";
import { Corners } from "./blueprint";
import { SectionLink } from "./section-link";
import { riseIn } from "./transitions";

/**
 * Sticky, blurred bar over a hairline. Every entry points at a section of the
 * landing page, as the design does. Pages that are not sections of the landing
 * (Pricing among them) are reached from the footer.
 */
const links = [
  { hash: "product", label: "Product" },
  { hash: "how", label: "Solutions" },
  { hash: "research", label: "Research" },
  { hash: "security", label: "Security" },
  { hash: "company", label: "Company" },
  { hash: "faq", label: "FAQ" },
] as const;

/** The width below which the row collapses into the drop panel. */
const COMPACT = "(max-width: 1080px)";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {links.map((link) => (
        <SectionLink key={link.label} hash={link.hash} onClick={onNavigate}>
          {link.label}
        </SectionLink>
      ))}
    </>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const headerRef = useRef<HTMLElement | null>(null);
  const close = () => setOpen(false);

  // While the panel is open it can be dismissed three ways, and it closes
  // itself if the viewport grows past the breakpoint that hides the toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const mq = window.matchMedia(COMPACT);
    const onBreakpoint = () => {
      if (!mq.matches) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);
    mq.addEventListener("change", onBreakpoint);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
      mq.removeEventListener("change", onBreakpoint);
    };
  }, [open]);

  return (
    <motion.header
      ref={headerRef}
      className="site-header"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={riseIn(0.05, 0.7)}
    >
      <div className="site-header__inner">
        <Logo />

        <nav className="site-nav">
          <NavLinks />
        </nav>

        <div className="header-actions">
          <Link
            to="/waitlist"
            className="btn btn--primary blueprint btn--hide-xs"
            aria-current={pathname === "/waitlist" ? "page" : undefined}
          >
            <Corners />
            Join the waitlist
          </Link>
          <Link to="/contact" className="btn btn--secondary btn--tinted btn--hide-sm">
            Talk to sales
          </Link>
          <Link to="/demo" className="btn btn--primary blueprint">
            <Corners />
            Book a demo
          </Link>
        </div>

        <button
          type="button"
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="site-nav-panel"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
        </button>
      </div>

      {/* AnimatePresence sits outside the condition: inside it, it would
          unmount with the panel and the exit animation could never play. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            key="panel"
            id="site-nav-panel"
            className="site-nav-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: spring, stiffness: 420, damping: 34 }}
          >
            <div>
              <NavLinks onNavigate={close} />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
