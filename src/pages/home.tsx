import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Cta } from "../components/cta";

const pillars = [
  {
    k: "01",
    title: "Multiplayer by default",
    body: "Work sessions with a shared, append-only transcript. One driver at a time, explicit handoffs, private forks when you need to think alone.",
  },
  {
    k: "02",
    title: "Agents propose, people decide",
    body: "Every AI action lands as a proposal card — decision, plan, task, or draft. Nothing touches canonical project state until a human approves it.",
  },
  {
    k: "03",
    title: "Artifacts, not just answers",
    body: "Turn a conversation into a brief, a deck, a literature review, or a thesis chapter with provenance back to every source that informed it.",
  },
  {
    k: "04",
    title: "Sensitivity-aware grounding",
    body: "Documents carry a tier — general, restricted, privileged. Retrieval and AI context respect it silently, per person, every time.",
  },
];

const audiences = [
  {
    title: "Enterprise knowledge teams",
    body: "Strategy, product, and operations teams that need AI across confidential material without leaking it across the org.",
    to: "/solutions",
  },
  {
    title: "Regulated and advisory firms",
    body: "Legal, audit, and consulting practices that need a tamper-evident record of who asked what, and what the model was allowed to see.",
    to: "/solutions#legal",
  },
  {
    title: "Research groups and thesis authors",
    body: "Labs, supervisors, and graduate students running long-form research with a shared library, citations, and review gates.",
    to: "/research",
  },
];

const sandboxFacts: Array<[string, string]> = [
  [
    "A clean project, just for you",
    "Its own organisation, its own library, its own event log. Nothing from anyone else; nothing of yours visible to anyone else.",
  ],
  [
    "Four colleagues with real clearances",
    "Priya, Omar, Aisha and Viktor — partner to restricted reviewer. Switch between them and watch what the brain is allowed to say change.",
  ],
  [
    "A generous model budget",
    "Enough turns for a full guided session with a couple of documents. When it runs out, everything else keeps working.",
  ],
];

export function HomePage() {
  useEffect(() => {
    document.title = "Kerniva — Private multiplayer AI workspaces for sensitive teams";
  }, []);
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">Enterprise AI workspace</span>
          <h1>
            The AI workspace where <span className="gradient-text">people stay in charge</span>.
          </h1>
          <p className="lede">
            Kerniva is a private, multiplayer workspace for teams that work on sensitive material.
            Collaborate in real time, ground AI in your own library, generate artifacts — and keep
            every decision governed and auditable.
          </p>
          <div className="hero__actions">
            <a href="/try" className="btn btn--primary">
              Try the live simulation
            </a>
            <Link to="/product" className="btn btn--secondary">
              See how it works
            </Link>
          </div>
          <div className="hero__meta">
            <span>Hosted in your AWS region</span>
            <span>Zero-retention model access</span>
            <span>Tenant isolation enforced at the database</span>
            <span>SSO, MFA, RBAC + ABAC</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="frame" aria-label="Product preview">
            <div className="frame__bar">
              <i /> <i /> <i />
            </div>
            <HomePreview />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Try Kerniva</span>
          <h2 style={{ fontSize: 34, marginBottom: 12, maxWidth: "26ch" }}>
            A real workspace of your own, in one click.
          </h2>
          <p className="lede" style={{ marginBottom: 28, maxWidth: "62ch" }}>
            The simulation is not a video: it is Kerniva itself, running a clean project created for
            you the moment you open it. Upload a document, ask the brain, drive a Relay, download
            the deliverable.
          </p>
          <div className="grid grid--3">
            {sandboxFacts.map(([t, b]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
          <p className="notice" style={{ marginTop: 20 }}>
            Files you upload stay in your sandbox only. They are deleted when it ends (two hours
            idle) and the whole simulation is wiped every night at 03:00 UTC. Please don&apos;t
            upload confidential material — see our <Link to="/privacy">privacy note</Link>.
          </p>
          <div className="hero__actions" style={{ marginTop: 24 }}>
            <a href="/try" className="btn btn--primary">
              Open the simulation
            </a>
          </div>
        </div>
      </section>

      <section className="section section--subtle">
        <div className="container">
          <span className="eyebrow">Why Kerniva</span>
          <h2 style={{ fontSize: 34, marginBottom: 40, maxWidth: "24ch" }}>
            Most AI tools are single-player and ungoverned. Serious work is neither.
          </h2>
          <div className="grid grid--2">
            {pillars.map((p) => (
              <div className="card" key={p.k}>
                <div className="card__icon">{p.k}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <div className="rule" />
            <h2>A project is the unit of work — and the unit of trust.</h2>
            <p>
              Each Kerniva project holds its own library, its own sessions, and its own append-only
              event log. The log is the truth; every view is a rebuildable projection of it. That
              means provenance is never an afterthought, and a compliance export is a query, not a
              project.
            </p>
            <ul className="feature-list">
              <li>Propose → validate → approve → commit for every governed change</li>
              <li>Explainability on every artifact: sources, tiers, and the approving human</li>
              <li>Policy envelopes and throttles per project, per role</li>
            </ul>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <EventLogPreview />
          </div>
        </div>
      </section>

      <section className="section section--subtle">
        <div className="container">
          <span className="eyebrow">Built for</span>
          <div className="grid grid--3" style={{ marginTop: 8 }}>
            {audiences.map((a) => (
              <Link to={a.to} className="card" key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
                <p style={{ marginTop: 16, color: "var(--brand-a)", fontWeight: 600 }}>
                  Learn more →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="stats">
            <div className="stat">
              <strong>3</strong>
              <span>sensitivity tiers enforced on every retrieval</span>
            </div>
            <div className="stat">
              <strong>1</strong>
              <span>single egress point for all model traffic</span>
            </div>
            <div className="stat">
              <strong>0</strong>
              <span>prompts, sources, or responses retained in telemetry</span>
            </div>
            <div className="stat">
              <strong>100%</strong>
              <span>of AI writes gated behind a human decision</span>
            </div>
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}

function HomePreview() {
  return (
    <div className="sim" style={{ minHeight: 0 }}>
      <div className="sim__topbar">
        <strong>Project</strong>
        <span className="sim__badge">Market entry — DACH</span>
        <span className="spacer" />
        <small>Driver: A. Rahman · 2 collaborators</small>
      </div>
      <div className="sim__body" style={{ minHeight: 360 }}>
        <aside className="sim__rail">
          <h5>Workspace</h5>
          <button className="active">Relay</button>
          <button>Library</button>
          <button>Artifacts</button>
          <button>Tasks</button>
          <h5>Governance</h5>
          <button>Cockpit</button>
          <button>Proposals</button>
        </aside>
        <div className="sim__main">
          <div className="msg">
            <span className="msg__who">A. Rahman</span>
            <div className="msg__body">
              Draft a go/no-go brief for the DACH entry using the board memo and the two analyst
              reports. Flag anything that leans on privileged pricing data.
            </div>
          </div>
          <div className="msg msg--agent">
            <span className="msg__who">Kerniva · agent (proposal)</span>
            <div className="msg__body">
              I grounded this in 3 library sources (2 general, 1 restricted). Proposed brief
              attached; section 4 references the restricted pricing model and is marked for reviewer
              attention.
            </div>
          </div>
          <div className="proposal">
            <span className="proposal__kind">Artifact proposal</span>
            <strong>Go/No-Go Brief — DACH market entry (v1)</strong>
            <small>
              Sources: Board memo Q2 · Analyst report (Berger) · Pricing model v3 (restricted)
            </small>
            <div className="proposal__actions">
              <button className="btn btn--primary btn--sm">Approve</button>
              <button className="btn btn--secondary btn--sm">Request changes</button>
            </div>
          </div>
        </div>
        <aside className="sim__inspector">
          <h3>Policy envelope</h3>
          <div className="panel">
            <div className="row row--between">
              <span>Model egress</span> <small>AI gateway · zero retention</small>
            </div>
            <div className="row row--between" style={{ marginTop: 8 }}>
              <span>Max tier in context</span>{" "}
              <span className="tier tier--restricted">Restricted</span>
            </div>
            <div className="row row--between" style={{ marginTop: 8 }}>
              <span>Agent writes</span> <small>Propose only</small>
            </div>
          </div>
          <h3>Recent events</h3>
          <div className="panel">
            <div className="event">
              <time>14:02:11</time>
              <span>session.started by a.rahman</span>
            </div>
            <div className="event">
              <time>14:02:40</time>
              <span>grounding.resolved 3 sources</span>
            </div>
            <div className="event">
              <time>14:03:05</time>
              <span>artifact.proposed brief-v1</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function EventLogPreview() {
  const rows: [string, string, string, string][] = [
    ["14:02:11", "session.started", "a.rahman", "—"],
    ["14:02:40", "grounding.resolved", "agent", "3 sources · max tier: restricted"],
    ["14:03:05", "artifact.proposed", "agent", "brief-v1"],
    ["14:06:22", "proposal.approved", "a.rahman", "brief-v1 → committed"],
    ["14:06:22", "projection.rebuilt", "system", "artifacts read-model"],
  ];
  return (
    <div className="table-wrap">
      <table className="compare">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Actor</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([at, type, actor, detail]) => (
            <tr key={at + type}>
              <td style={{ fontVariantNumeric: "tabular-nums", color: "var(--muted)" }}>{at}</td>
              <td>
                <code>{type}</code>
              </td>
              <td>{actor}</td>
              <td style={{ color: "var(--muted)" }}>{detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
