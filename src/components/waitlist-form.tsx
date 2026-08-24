import { useState, type FormEvent } from "react";

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
  if (sent) {
    return (
      <div className="notice">
        You are on the list — we will write to you when the simulation opens.
      </div>
    );
  }
  return (
    <form className={`form${compact ? "" : " card"}`} onSubmit={submit}>
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
        I want it for
        <select name="interest" defaultValue="enterprise">
          <option value="enterprise">Enterprise workspace</option>
          <option value="research">Research &amp; thesis</option>
          <option value="consulting">Consulting &amp; advisory</option>
          <option value="other">Something else</option>
        </select>
      </label>
      <button className="btn btn--primary" type="submit">
        Join the waitlist
      </button>
      <small style={{ color: "var(--muted)" }}>
        One email when access opens. No newsletter, no sharing.
      </small>
    </form>
  );
}
