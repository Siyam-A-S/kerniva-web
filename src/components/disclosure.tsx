import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE } from "./transitions";

/**
 * An accessible expand/collapse row.
 *
 * This replaced a native <details>/<summary> pair: the element collapses its
 * own content, so there is no way to hand Motion the height without breaking
 * the element's contract. The button + region pattern below carries the same
 * semantics explicitly.
 */
export function Disclosure({ question, children }: { question: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="disclosure">
      <button
        type="button"
        id={`${id}-button`}
        className="disclosure__summary"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((v) => !v)}
      >
        <i aria-hidden="true">{open ? "−" : "+"}</i>
        {question}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="panel"
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
