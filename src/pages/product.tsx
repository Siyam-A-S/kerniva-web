import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";

const surfaces = [
  {
    name: "Relay",
    tag: "Collaboration",
    body: "Human-to-human work sessions with an append-only transcript. One execution lease at a time, explicit handoffs with consent-to-redaction, private notebooks and forks, and a plan mode for long driving sessions. AI is never in the send path.",
  },
  {
    name: "Library",
    tag: "Knowledge",
    body: "Upload documents, connect SharePoint, and watch assets move through verified → extracted → graphed. Each asset carries a sensitivity tier; audience views are materialized per role so redaction is silent and exact.",
  },
  {
    name: "Ask & Chat",
    tag: "AI surface",
    body: "A grounded loop over your library with tool exposure scoped by role and project. Model traffic leaves through one gateway with zero retention; prompts and responses are never written to telemetry.",
  },
  {
    name: "Artifacts",
    tag: "Output",
    body: "Briefs, decks, reports, literature reviews, and chapters produced from sessions — each with provenance to sources, tiers, and the approving person. Export to DOCX, PPTX, PDF, or Markdown.",
  },
  {
    name: "Cockpit",
    tag: "Governance",
    body: "The project's control room: proposal inbox, policy envelope and throttles, stage graph, skill-as-execution-contract, explainability, and projection integrity checks.",
  },
  {
    name: "Tasks & Phases",
    tag: "Execution",
    body: "Read-models derived from the event log. Phases, tasks, reminders, and handoffs stay in sync with what was actually approved — never what an agent merely suggested.",
  },
];

const steps = [
  ["Propose", "An agent or a collaborator proposes a decision, plan, task, or artifact."],
  [
    "Validate",
    "Policy envelope, sensitivity tiers, and skill contracts are checked automatically.",
  ],
  ["Approve", "The session driver — a human — approves, requests changes, or rejects."],
  ["Commit", "The event is appended to the project log; every projection rebuilds from it."],
];

export function ProductPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product"
        title="One governed workspace for conversation, knowledge, and output."
        lede="Kerniva separates what people say, what the organization knows, and what the AI produces — then connects them through a single, auditable project log."
      />
      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {surfaces.map((s) => (
              <div className="card" key={s.name}>
                <span className="eyebrow">{s.tag}</span>
                <h3>{s.name}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--subtle">
        <div className="container">
          <span className="eyebrow">The governed protocol</span>
          <h2 style={{ fontSize: 32, marginBottom: 36, maxWidth: "26ch" }}>
            Agents always propose. Humans decide. The log is truth.
          </h2>
          <div className="grid grid--4">
            {steps.map(([t, b], i) => (
              <div className="card" key={t}>
                <div className="card__icon">{i + 1}</div>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <div className="rule" />
            <h2>Skills as execution contracts.</h2>
            <p>
              Every capability an agent can use — summarize, draft, extract, compare, cite — is
              declared as a skill with explicit inputs, allowed tools, model gating, and output
              schema. Teams can extend the catalog; administrators decide which skills each project
              may run.
            </p>
            <ul className="feature-list">
              <li>Tool and model gating per skill, per project</li>
              <li>Deterministic validation before any proposal reaches a reviewer</li>
              <li>Versioned skill contracts recorded alongside every artifact</li>
            </ul>
          </div>
          <div className="card">
            <h3>Deployment model</h3>
            <p style={{ marginBottom: 16 }}>
              Kerniva runs as a web workspace and a terminal CLI over the same governed HTTP API,
              hosted in your AWS account or ours.
            </p>
            <ul className="feature-list">
              <li>Web app on CloudFront + S3; API on ECS Fargate</li>
              <li>PostgreSQL with forced row-level security and pgvector</li>
              <li>FIFO ingestion queue with retries and dead-letter handling</li>
              <li>Cognito for identity, SSO, and MFA</li>
            </ul>
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
