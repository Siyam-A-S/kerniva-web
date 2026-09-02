import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { PageHeader } from "../components/page-header";
import { EASE } from "../components/transitions";
import {
  CONTACT_INTERESTS,
  CONTACT_PAGE,
  EMAIL_HELLO,
  EMAIL_RESEARCH,
  EMAIL_SECURITY,
} from "../content";

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
        eyebrow={CONTACT_PAGE.eyebrow}
        title={CONTACT_PAGE.title}
        lede={CONTACT_PAGE.lede}
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
                  <div className="notice">{CONTACT_PAGE.sent}</div>
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
                    {CONTACT_PAGE.name}
                    <input name="name" required autoComplete="name" />
                  </label>
                  <label>
                    {CONTACT_PAGE.email}
                    <input name="email" type="email" required autoComplete="email" />
                  </label>
                  <label>
                    {CONTACT_PAGE.org}
                    <input name="org" autoComplete="organization" />
                  </label>
                  <label>
                    {CONTACT_PAGE.interest}
                    <select name="interest" defaultValue="enterprise">
                      {CONTACT_INTERESTS.map((interest) => (
                        <option value={interest.value} key={interest.value}>
                          {interest.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    {CONTACT_PAGE.message}
                    <textarea name="message" rows={5} />
                  </label>
                  <button className="btn btn--primary" type="submit">
                    {CONTACT_PAGE.submit}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
          <div>
            <div className="rule" />
            <h2 className="h-section" style={{ fontSize: 26, marginBottom: 12 }}>
              {CONTACT_PAGE.directTitle}
            </h2>
            <ul className="feature-list">
              <li>
                {CONTACT_PAGE.salesLabel} <a href={`mailto:${EMAIL_HELLO}`}>{EMAIL_HELLO}</a>
              </li>
              <li>
                {CONTACT_PAGE.securityLabel}{" "}
                <a href={`mailto:${EMAIL_SECURITY}`}>{EMAIL_SECURITY}</a>
              </li>
              <li>
                {CONTACT_PAGE.researchLabel}{" "}
                <a href={`mailto:${EMAIL_RESEARCH}`}>{EMAIL_RESEARCH}</a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
