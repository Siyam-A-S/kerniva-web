import { motion } from "motion/react";
import { reveal } from "./transitions";

/*
 * "Built with and backed by": a fixed label beside a ticker of partner marks.
 *
 * Every mark is inline SVG or live text, so the strip costs no network request
 * and stays crisp at any density. The design reference pulled the Claude glyph
 * from cdn.simpleicons.org; that path data is inlined here instead, which also
 * keeps the CSP in nginx.conf untouched.
 */

function MicrosoftMark() {
  return (
    <span className="backer">
      <svg width="22" height="22" viewBox="0 0 23 23" aria-hidden="true">
        <rect x="0" y="0" width="11" height="11" fill="#F25022" />
        <rect x="12" y="0" width="11" height="11" fill="#7FBA00" />
        <rect x="0" y="12" width="11" height="11" fill="#00A4EF" />
        <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
      </svg>
      <span style={{ fontSize: 19, fontWeight: 600, color: "#5e5e5e" }}>Microsoft</span>
    </span>
  );
}

function AwsMark() {
  return (
    <span className="backer" role="img" aria-label="AWS">
      <span className="backer__aws" aria-hidden="true">
        <span>aws</span>
        <svg width="34" height="9" viewBox="0 0 34 9">
          <path
            d="M1 2c7 5 22 5 29 1"
            fill="none"
            stroke="#FF9900"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M30 0l4 2.4-4.4 1.8z" fill="#FF9900" />
        </svg>
      </span>
    </span>
  );
}

const GOOGLE = [
  ["G", "#4285F4"],
  ["o", "#EA4335"],
  ["o", "#FBBC05"],
  ["g", "#4285F4"],
  ["l", "#34A853"],
  ["e", "#EA4335"],
] as const;

function GoogleMark() {
  return (
    <span className="backer" role="img" aria-label="Google">
      <span aria-hidden="true" style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em" }}>
        {GOOGLE.map(([letter, color], i) => (
          <span key={i} style={{ color }}>
            {letter}
          </span>
        ))}
      </span>
    </span>
  );
}

function ClaudeMark() {
  return (
    <span className="backer">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#D97757" aria-hidden="true">
        <path d="m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z" />
      </svg>
      <span style={{ fontSize: 19, fontWeight: 600, color: "var(--color-text)" }}>Claude</span>
    </span>
  );
}

function BackerSet({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className={`backers__set${duplicate ? " backers__set--dupe" : ""}`}
      aria-hidden={duplicate || undefined}
    >
      <MicrosoftMark />
      <AwsMark />
      <GoogleMark />
      <ClaudeMark />
    </div>
  );
}

export function Backers() {
  return (
    <motion.section className="backers-band" {...reveal}>
      <div className="container">
        <div className="backers">
          <span className="backers__label">Built with and backed by</span>
          <div className="backers__viewport">
            {/* Two identical sets. Each mark carries its own trailing gap, so
                translateX(-50%) lands exactly on one set width and the loop
                has no seam. A `gap` on the track would leave it half a gap
                short and the ticker would jump once per cycle. */}
            <div className="backers__track">
              <BackerSet />
              <BackerSet duplicate />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
