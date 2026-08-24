import { Link } from "react-router-dom";
import { PageHeader } from "../components/page-header";

const points: Array<[string, string]> = [
  [
    "No account, one cookie",
    "Opening the simulation sets a single HttpOnly cookie that identifies your sandbox. It carries no personal data and expires with the sandbox (two hours idle). We do not set analytics or advertising cookies.",
  ],
  [
    "Your sandbox is yours alone",
    "Each visit creates its own organisation and project in the database. Row-level security keeps sandboxes apart; nothing you upload or write is visible to other visitors or to the Kerniva team in the normal course of operation.",
  ],
  [
    "Uploads are temporary",
    "Files you upload stay in your sandbox only. They are deleted when the sandbox ends and the whole simulation — database, files, graphs — is rebuilt from scratch every night at 03:00 UTC. Please do not upload confidential material.",
  ],
  [
    "Model calls",
    "Questions and documents you choose to work with are sent to Google Vertex AI (Gemini) through our own proxy under zero-retention terms: they are not used to train models. We log only counts and sizes, never content.",
  ],
  [
    "What we keep",
    "Aggregate counters (sandboxes per day, model turns, tokens) and a one-way hash of your IP address for rate limiting. No emails, no names, no document text.",
  ],
  [
    "Questions",
    "Write to privacy@kerniva.app. For the product itself — hosted in your own AWS account — see the security page.",
  ],
];

export function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="What the simulation does with your data."
        lede="The public simulation (currently behind a waitlist) is a real Kerniva workspace that is deliberately disposable. This note says exactly what will be stored, for how long, and who can see it when it opens."
      />
      <section className="section">
        <div className="container grid grid--2">
          {points.map(([t, b]) => (
            <div className="card" key={t}>
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section section--tight">
        <div className="container">
          <p className="lede">
            Looking for the enterprise posture — SSO, residency, audit? See{" "}
            <Link to="/security">Security</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
