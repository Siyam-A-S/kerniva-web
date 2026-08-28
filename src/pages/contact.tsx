import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "../components/page-header";
import { EASE } from "../components/transitions";

export function ContactPage() {
  const [sent, setSent] = useState(false);
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST to the contact endpoint (API Gateway + Lambda → SES) once provisioned.
    setSent(true);
  }
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Talk to the team."
        lede="Tell us about your team, your material, and what you need to see before you can adopt an AI workspace."
      />
      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          {/* `layout` on the form so the card resizes with its contents rather
              than snapping when the fields give way to the notice. */}
          <motion.form layout className="card" onSubmit={submit}>
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  layout
                  key="sent"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="notice">Thank you. We will reply within two business days.</div>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  key="fields"
                  className="form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <label>
                    Name
                    <input name="name" required autoComplete="name" />
                  </label>
                  <label>
                    Work email
                    <input name="email" type="email" required autoComplete="email" />
                  </label>
                  <label>
                    Organization
                    <input name="org" autoComplete="organization" />
                  </label>
                  <label>
                    I am interested in
                    <select name="interest" defaultValue="enterprise">
                      <option value="enterprise">Enterprise workspace</option>
                      <option value="research">Research & thesis</option>
                      <option value="security">Security review</option>
                      <option value="other">Something else</option>
                    </select>
                  </label>
                  <label>
                    Message
                    <textarea name="message" rows={5} />
                  </label>
                  <button className="btn btn--primary" type="submit">
                    Send
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
          <div>
            <div className="rule" />
            <h2 className="h-section" style={{ fontSize: 26, marginBottom: 12 }}>
              Direct lines
            </h2>
            <ul className="feature-list">
              <li>
                Sales and partnerships: <a href="mailto:hello@kerniva.app">hello@kerniva.app</a>
              </li>
              <li>
                Security reviews: <a href="mailto:security@kerniva.app">security@kerniva.app</a>
              </li>
              <li>
                Research programs: <a href="mailto:research@kerniva.app">research@kerniva.app</a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
