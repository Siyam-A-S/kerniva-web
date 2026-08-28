/*
 * Shared Motion values, so the whole site animates on one curve.
 * The easing and durations come from the design handoff's choreography.
 */
import type { Transition, Variants } from "motion/react";

/** The system's easing: cubic-bezier(.2,.7,.2,1). */
export const EASE = [0.2, 0.7, 0.2, 1] as const;

/** Fade and lift, used for both the entrance and the scroll reveal. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 34 },
  shown: { opacity: 1, y: 0 },
};

export const riseIn = (delay: number, duration = 0.8): Transition => ({
  duration,
  delay,
  ease: EASE,
});

/** Scroll reveal: a shorter lift, played once when the block scrolls in. */
export const reveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.1 } as const,
  transition: { duration: 0.7, ease: EASE } as Transition,
};

/*
 * Cycling highlight colours. Motion interpolates between colour values, and
 * cannot interpolate a `color-mix()`, so these mirror the tokens literally:
 * accent-100, accent-400, and the 18% navy divider.
 */
export const CYCLE_IDLE_BG = "rgba(249, 238, 252, 0)";
export const CYCLE_ACTIVE_BG = "#f9eefc";
export const CYCLE_IDLE_BORDER = "rgba(10, 27, 77, 0.18)";
export const CYCLE_ACTIVE_BORDER = "#c07fd8";

export const cycleTransition: Transition = { duration: 0.4, ease: "easeOut" };
