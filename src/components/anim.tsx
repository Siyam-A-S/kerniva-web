/*
 * The two animations that are not Motion's job.
 *
 * Orchestration (entrance, scroll reveal, cycling highlights, the demo form's
 * enter/exit) is handled by motion/react. The always-on decorative loops live
 * in styles.css as CSS keyframes, because they run for as long as the page is
 * open and the compositor should carry them, not rAF. What is left here is a
 * text effect and an interval, neither of which an animation library helps.
 *
 * Named `anim` rather than `motion` so it cannot be confused with the package.
 */
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Index of the currently highlighted item in a cycling group. Distinct from
 * Motion's own `useCycle`, which returns a manual [state, cycle] pair; this one
 * advances itself on a timer.
 */
export function useAutoCycle(count: number, intervalMs = 2600): number {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || count < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, reduced]);

  return reduced ? 0 : index;
}

/**
 * Types each phrase out, holds, deletes at four characters a tick, then moves
 * on. `phrases` must be a stable reference (a module-level constant), since a
 * fresh array on every render would restart the loop.
 */
export function useTypewriter(phrases: readonly string[], charMs = 45, holdMs = 1600): string {
  const reduced = useReducedMotion();
  const [text, setText] = useState(phrases[0] ?? "");

  useEffect(() => {
    if (reduced || phrases.length === 0) {
      setText(phrases[0] ?? "");
      return;
    }
    let phrase = 0;
    let count = 0;
    let step = 1;
    let hold: ReturnType<typeof setTimeout> | undefined;
    setText("");
    const id = setInterval(() => {
      const current = phrases[phrase] ?? "";
      count = Math.max(0, count + step);
      setText(current.slice(0, count));
      if (step > 0 && count >= current.length) {
        step = 0;
        hold = setTimeout(() => {
          step = -4;
        }, holdMs);
      } else if (step < 0 && count <= 0) {
        step = 1;
        phrase = (phrase + 1) % phrases.length;
      }
    }, charMs);
    return () => {
      clearInterval(id);
      if (hold) clearTimeout(hold);
    };
  }, [phrases, charMs, holdMs, reduced]);

  return text;
}
