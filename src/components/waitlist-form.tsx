import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "./transitions";

/**
 * The waitlist form shown everywhere the live simulation used to be offered.
 * Client-side only for now; the endpoint is a TODO alongside the contact form.
 */
export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: POST to the waitlist endpoint once provisioned (same backend as contact).
    setSent(true);
  }

  const swap = {
    layout: true,
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: { duration: 0.35, ease: EASE },
  } as const;

  return (
    // `layout` so the surrounding card resizes with its contents instead of
    // snapping when the fields give way to the confirmation.
    <motion.form layout className={compact ? undefined : "card"} onSubmit={submit}>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="sent" {...swap}>
            <div className="notice">
              You are on the list. We will write to you when the simulation opens.
            </div>
          </motion.div>
        ) : (
          <motion.div key="fields" className="form" {...swap}>
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
              What kind of work does your team do?
              <select name="work" defaultValue="consulting">
                <option value="consulting">Consulting and advisory</option>
                <option value="research">Research</option>
                <option value="product">Product and project work</option>
                <option value="other">Other</option>
              </select>
            </label>
            <button className="btn btn--primary" type="submit">
              Join the waitlist
            </button>
            <small style={{ color: "var(--muted)" }}>
              One email when access opens. No newsletter, no sharing.
            </small>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
