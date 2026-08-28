import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Corners } from "../components/blueprint";
import { CheckCircleIcon } from "../components/icons";
import { EASE } from "../components/transitions";

const muted = (pct: number) => `color-mix(in srgb, var(--color-text) ${pct}%, transparent)`;

const PROMISES = [
  {
    n: "01",
    title: "A walkthrough, not a pitch",
    body: "We set up a workspace live and run a handoff end to end.",
  },
  {
    n: "02",
    title: "Your stack, your questions",
    body: "Tell us what your team uses and we will show how it connects.",
  },
  {
    n: "03",
    title: "Leave with a workspace",
    body: "Your trial project stays live after the call, so you can keep working in it.",
  },
] as const;

const TEAM_SIZES = ["1–10", "11–50", "51–200", "200+"] as const;

/**
 * The demo page deliberately runs outside SiteLayout: the design strips the
 * full site nav down to a way back and a single alternative.
 */
export function DemoPage() {
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    document.title = "Book a demo | Kerniva";
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
            ← Back to site
          </Link>
          <Link
            to="/waitlist"
            className="btn btn--ghost"
            style={{ whiteSpace: "nowrap", marginLeft: "auto" }}
          >
            Join the waitlist instead
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
              <span style={{ display: "block" }}>Join the design-partner program.</span>
              <span style={{ display: "block", color: "var(--color-accent-700)" }}>
                Bring a real project.
              </span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: "25px", maxWidth: "52ch", margin: "24px 0 0" }}>
              Thirty minutes, on your team’s own work. We will show how research, files, AI
              sessions, and decisions stay connected, so the next collaborator never starts over.
            </p>

            <div className="rows" style={{ marginTop: 36 }}>
              {PROMISES.map((item) => (
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
              <span>Demo request</span>
              <span>KV-01</span>
              <span>30 min</span>
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
                    Request received
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
                    Check your inbox for a calendar link. In the meantime, you can put your team in
                    the queue for a workspace of your own.
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
                      Join the waitlist
                    </Link>
                    <Link to="/" className="btn btn--ghost">
                      Back to site
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
                      <label htmlFor="kv-name">Name</label>
                      <input
                        className="input"
                        id="kv-name"
                        name="name"
                        required
                        autoComplete="name"
                        placeholder="Ada Torres"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="kv-email">Work email</label>
                      <input
                        className="input"
                        id="kv-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="ada@company.com"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="kv-company">Company</label>
                    <input
                      className="input"
                      id="kv-company"
                      name="company"
                      autoComplete="organization"
                      placeholder="Acme Studio"
                    />
                  </div>

                  <div className="field">
                    <label id="kv-size-label">Team size</label>
                    <div className="seg" role="radiogroup" aria-labelledby="kv-size-label">
                      {TEAM_SIZES.map((size, i) => (
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
                      What should we focus on?{" "}
                      <span style={{ fontWeight: 400, color: muted(55) }}>(optional)</span>
                    </label>
                    <textarea
                      className="input"
                      id="kv-notes"
                      name="notes"
                      rows={3}
                      placeholder="e.g. handoffs between our research and design teams"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn--primary btn--block blueprint"
                    style={{ padding: 11, fontSize: 15 }}
                  >
                    <Corners />
                    Book my demo
                  </button>

                  <p style={{ fontSize: 12.5, margin: 0, color: muted(60) }}>
                    We reply within one business day with a calendar link. No mailing list, no
                    follow-up sequence.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            <motion.div layout className="statusbar">
              <span className="dot-live" />
              Live slots this week · Tue to Fri, 9:00 to 17:00 CET
            </motion.div>
          </motion.div>
        </div>

        <footer
          className="site-footer__bar"
          style={{ borderTop: "1px solid var(--color-divider)" }}
        >
          <img src="/kerniva-wordmark.svg" alt="Kerniva" />
          <span>AI workspace for teams with no time to lose</span>
          <span className="end">© {new Date().getFullYear()} Kerniva</span>
        </footer>
      </main>
    </>
  );
}
