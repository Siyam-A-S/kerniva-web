import { PageHeader } from "../components/page-header";
import { WaitlistForm } from "../components/waitlist-form";

export function WaitlistPage() {
  return (
    <>
      <PageHeader
        eyebrow="Early access"
        title="The live simulation is almost ready."
        lede="Try Kerniva will give you a real workspace of your own: upload a document, ask the brain, drive a Relay session, approve an artifact. We are opening it in small waves. Leave your email and you will get access in the next one."
      />
      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <WaitlistForm />
          <div>
            <div className="rule" />
            <h2 style={{ fontSize: 26, marginBottom: 12 }}>What you will get</h2>
            <ul className="feature-list">
              <li>A clean project with a sample library, just for you, no account needed</li>
              <li>The real product: Relay, Library, proposals, Cockpit, the event log</li>
              <li>A generous model budget for a full guided session</li>
              <li>Everything disposable: your sandbox is wiped when it ends</li>
            </ul>
            <p style={{ marginTop: 20, color: "var(--ink-2)" }}>
              Can&apos;t wait? A working session with the team is the fastest way to see Kerniva on
              your own material: <a href="mailto:hello@kerniva.app">hello@kerniva.app</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
