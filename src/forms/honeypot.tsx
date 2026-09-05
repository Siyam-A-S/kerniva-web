import { HONEYPOT_FIELD } from "../../shared/forms";

/**
 * Off-screen rather than `display: none`: some bots skip hidden inputs, and
 * this way the field is still in the layout they parse. `tabIndex={-1}` and
 * `aria-hidden` keep it away from keyboard and screen-reader users.
 */
export function Honeypot() {
  return (
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}
    >
      <label>
        Website
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
