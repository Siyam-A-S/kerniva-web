import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Corners } from "../components/blueprint";
import { CheckCircleIcon } from "../components/icons";
import { EASE } from "../components/transitions";
import {
  BTN_JOIN_WAITLIST,
  DEMO_PAGE,
  DEMO_PROMISES,
  DEMO_TEAM_SIZES,
  TAGLINE,
  TITLE_DEMO,
} from "../content";

const muted = (pct: number) => `color-mix(in srgb, var(--color-text) ${pct}%, transparent)`;

/**
 * The demo page deliberately runs outside SiteLayout: the design strips the
 * full site nav down to a way back and a single alternative.
 */
export function DemoPage() {
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    document.title = TITLE_DEMO;
  }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST to the demo-request endpoint once provisioned (same backend
    // as the contact and waitlist forms).
    setBooked(true);
  }

  return (
    <>
      <header className="slim-header">
        <div className="slim-header__inner">
          <Link to="/" className="brand" aria-label="Kerniva home">
            <img src="/kerniva-wordmark.svg" alt="Kerniva" style={{ height: 22, width: "auto" }} />
          </Link>
          <Link to="/" style={{ whiteSpace: "nowrap" }}>
            {DEMO_PAGE.back}
          </Link>
          <Link
            to="/waitlist"
            className="btn btn--ghost"
            style={{ whiteSpace: "nowrap", marginLeft: "auto" }}
          >
            {DEMO_PAGE.waitlistInstead}
          </Link>
        </div>
      </header>

      <main className="container">
        <div className="split" style={{ gap: "clamp(32px, 5vw, 88px)", padding: "72px 0 88px" }}>
          <div>
            <h1
              className="h-display"
              style={{ fontSize: "clamp(40px, 4.6vw, 64px)", lineHeight: 1.05 }}
            >
              <span style={{ display: "block" }}>{DEMO_PAGE.line1}</span>
              <span style={{ display: "block", color: "var(--color-accent-700)" }}>
                {DEMO_PAGE.line2}
              </span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: "25px", maxWidth: "52ch", margin: "24px 0 0" }}>
              {DEMO_PAGE.lede}
            </p>

            <div className="rows" style={{ marginTop: 36 }}>
              {DEMO_PROMISES.map((item) => (
                <div key={item.n} style={{ display: "flex", gap: 16, padding: "16px 0" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      fontSize: 15,
                      color: "var(--color-accent-700)",
                      flex: "none",
                      width: 28,
                    }}
                  >
                    {item.n}
                  </span>
                  <div>
                    <div
                      className="h-sub"
                      style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18 }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 14.5,
                        lineHeight: "22px",
                        color: muted(75),
                        marginTop: 3,
                      }}
                    >
                      {item.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* `layout` so the plate resizes smoothly when the form gives way to
              the confirmation, instead of collapsing and then jumping. Its
              direct children carry `layout` too: a parent mid-animation is
              scaled, and un-counter-scaled children would squash. */}
          <motion.div
            layout
            className="blueprint"
            style={{ background: "var(--color-bg)", boxShadow: "var(--shadow-md)" }}
          >
            <Corners animated />
            <motion.div layout className="plate__bar">
              <span>{DEMO_PAGE.plateTitle}</span>
              <span>{DEMO_PAGE.plateRef}</span>
              <span>{DEMO_PAGE.plateLength}</span>
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              {booked ? (
                <motion.div
                  layout
                  key="booked"
                  style={{ padding: "40px 28px", textAlign: "center" }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <CheckCircleIcon
                    size={56}
                    style={{ margin: "0 auto", color: "var(--color-accent)" }}
                  />
                  <h2
                    style={{
                      fontSize: 26,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                      margin: "18px 0 8px",
                    }}
                  >
                    {DEMO_PAGE.bookedTitle}
                  </h2>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: "23px",
                      maxWidth: "40ch",
                      margin: "0 auto",
                      color: muted(78),
                    }}
                  >
                    {DEMO_PAGE.bookedBody}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-3)",
                      justifyContent: "center",
                      marginTop: 24,
                      flexWrap: "wrap",
                    }}
                  >
                    <Link to="/waitlist" className="btn btn--primary blueprint">
                      <Corners />
                      {BTN_JOIN_WAITLIST}
                    </Link>
                    <Link to="/" className="btn btn--ghost">
                      {DEMO_PAGE.backToSite}
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  layout
                  key="form"
                  onSubmit={submit}
                  style={{ display: "flex", flexDirection: "column", gap: 18, padding: 24 }}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                      gap: 18,
                    }}
                  >
                    <div className="field">
                      <label htmlFor="kv-name">{DEMO_PAGE.name}</label>
                      <input
                        className="input"
                        id="kv-name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder={DEMO_PAGE.namePlaceholder}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="kv-email">{DEMO_PAGE.email}</label>
                      <input
                        className="input"
                        id="kv-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder={DEMO_PAGE.emailPlaceholder}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="kv-company">{DEMO_PAGE.company}</label>
                    <input
                      className="input"
                      id="kv-company"
                      name="company"
                      autoComplete="organization"
                      placeholder={DEMO_PAGE.companyPlaceholder}
                    />
                  </div>

                  <div className="field">
                    <label id="kv-size-label">{DEMO_PAGE.teamSize}</label>
                    <div className="seg" role="radiogroup" aria-labelledby="kv-size-label">
                      {DEMO_TEAM_SIZES.map((size, i) => (
                        <label className="seg-opt" key={size}>
                          <input
                            type="radio"
                            name="team-size"
                            value={size}
                            defaultChecked={i === 0}
                          />
                          {size}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="kv-notes">
                      {DEMO_PAGE.notes}{" "}
                      <span style={{ fontWeight: 400, color: muted(55) }}>
                        {DEMO_PAGE.notesOptional}
                      </span>
                    </label>
                    <textarea
                      className="input"
                      id="kv-notes"
                      name="notes"
                      rows={3}
                      placeholder={DEMO_PAGE.notesPlaceholder}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn--primary btn--block blueprint"
                    style={{ padding: 11, fontSize: 15 }}
                  >
                    <Corners />
                    {DEMO_PAGE.submit}
                  </button>

                  <p style={{ fontSize: 12.5, margin: 0, color: muted(60) }}>
                    {DEMO_PAGE.finePrint}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            <motion.div layout className="statusbar">
              <span className="dot-live" />
              {DEMO_PAGE.slots}
            </motion.div>
          </motion.div>
        </div>

        <footer
          className="site-footer__bar"
          style={{ borderTop: "1px solid var(--color-divider)" }}
        >
          <img src="/kerniva-wordmark.svg" alt="Kerniva" />
          <span>{TAGLINE}</span>
          <span className="end">© {new Date().getFullYear()} Kerniva</span>
        </footer>
      </main>
    </>
  );
}
