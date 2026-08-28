import type { CSSProperties, ReactNode } from "react";
import { motion } from "motion/react";

const PLACES = ["tl", "tr", "bl", "br"] as const;

/**
 * The four "+" registration crosses that overhang a hairline frame's corners.
 * Rendered as bare children so the frame can be any element: a div, a button,
 * or a link. The crosses themselves are drawn in CSS by `.blueprint > .corner`.
 *
 * `animated` opts the crosses into Motion's layout tracking. Only pass it when
 * the frame itself carries `layout`: a parent mid-layout-animation is scaled,
 * and anything inside it that is not counter-scaled gets visibly stretched.
 * Everywhere else these stay plain elements, since `layout` costs a measure on
 * every render and there are a dozen or so frames on the site.
 */
export function Corners({ animated = false }: { animated?: boolean } = {}) {
  if (!animated) {
    return (
      <>
        {PLACES.map((place) => (
          <i key={place} className={`corner ${place}`} />
        ))}
      </>
    );
  }
  return (
    <>
      {PLACES.map((place) => (
        <motion.i layout key={place} className={`corner ${place}`} />
      ))}
    </>
  );
}

/** A hairline-bordered box with registration crosses: the system's signature frame. */
export function Blueprint({
  className = "",
  style,
  id,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  id?: string;
  children?: ReactNode;
}) {
  return (
    <div id={id} className={`blueprint${className ? ` ${className}` : ""}`} style={style}>
      <Corners />
      {children}
    </div>
  );
}
