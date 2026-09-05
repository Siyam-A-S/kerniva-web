import { AnimatePresence, motion } from "motion/react";
import { EASE } from "./transitions";
import { BTN_JOIN_WAITLIST, WAITLIST_FORM, WAITLIST_WORK_KINDS } from "../content";
import { useFormSubmit } from "../forms/submit";
import { Honeypot } from "../forms/honeypot";

const FIELDS = ["name", "email", "org", "work"] as const;

/**
 * The waitlist form shown everywhere the live simulation used to be offered.
 * Posts to the same-origin forms API; a failed send surfaces as an error
 * rather than a confirmation.
 */
export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const { state, onSubmit } = useFormSubmit("waitlist", FIELDS);
  const sending = state.status === "sending";

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
    <motion.form layout className={compact ? undefined : "card"} onSubmit={onSubmit}>
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "sent" ? (
          <motion.div key="sent" {...swap}>
            <div className="notice">{WAITLIST_FORM.sent}</div>
          </motion.div>
        ) : (
          <motion.div key="fields" className="form" {...swap}>
            <label>
              {WAITLIST_FORM.name}
              <input name="name" required autoComplete="name" />
            </label>
            <label>
              {WAITLIST_FORM.email}
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label>
              {WAITLIST_FORM.org}
              <input name="org" autoComplete="organization" />
            </label>
            <label>
              {WAITLIST_FORM.work}
              <select name="work" defaultValue="consulting">
                {WAITLIST_WORK_KINDS.map((kind) => (
                  <option value={kind.value} key={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </label>
            <Honeypot />
            <button className="btn btn--primary" type="submit" disabled={sending}>
              {sending ? WAITLIST_FORM.submitting : BTN_JOIN_WAITLIST}
            </button>
            {state.status === "error" ? (
              <div className="notice notice--error" role="alert">
                {state.message}
              </div>
            ) : null}
            <small style={{ color: "var(--muted)" }}>{WAITLIST_FORM.note}</small>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}
