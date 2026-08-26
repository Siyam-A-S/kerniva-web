import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Cta } from "../components/cta";
import { WaitlistForm } from "../components/waitlist-form";

const pillars = [
  {
    k: "01",
    title: "One shared project brain",
    body: "Kerniva keeps research, files, AI sessions, and decisions connected to the project, and not scattered across individual tools and accounts.",
  },
  {
    k: "02",
    title: "Handoffs without starting over",
    body: "When work changes hands, the next person inherits what was done, why decisions were made, and what needs to happen next (instead of spending hours decoding documentation).",
  },
  {
    k: "03",
    title: "From shared context to finished work",
    body: "Turn team and AI work into briefs, decks, reports, and other deliverables, with every supporting source connected.",
  },
];

const audiences: Array<{ title: string; body: string; brand?: boolean }> = [
  {
    title: "Consulting and advisory",
    body: "Carry market research, interview notes, analyses, and draft decks to the next analyst, without another rebrief slowing down the engagement.",
    brand: true,
  },
  {
    title: "Strategy and operations",
    body: "Keep business cases, market-entry research, operating assumptions, and leadership decisions connected as initiatives move across functions.",
  },
  {
    title: "Research and intelligence",
    body: "Build on source libraries, hypotheses, citations, and previous findings, without repeating searches or losing the evidence behind the research.",
  },
  {
    title: "Risk, audit, and compliance",
    body: "Connect evidence, control findings, reviewer comments, and approvals while keeping sensitive context limited to authorized people and agents.",
  },
];

const earlyAccessPoints: string[] = [
  "A workspace built around your team’s workflow",
  "Guided onboarding directly with the founders",
  "Early influence over what Kerniva becomes",
];

export function HomePage() {
  useEffect(() => {
    document.title = "Kerniva: AI workspace for teams with no time to lose";
  }, []);
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">Design-partner program</span>
          <h1>
            AI workspace for teams with <span className="gradient-text">no time to lose</span>.
          </h1>
          <p className="lede">
            Kerniva connects your team&apos;s research, files, AI sessions, and project decisions in
            real time, so the next collaborator can continue without reconstructing context.
          </p>
          <div className="hero__actions">
            <Link to="/waitlist" className="btn btn--primary">
              Join the design-partner program
            </Link>
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

      <section className="section" id="waitlist">
        <div className="container split" style={{ alignItems: "center" }}>
          <div>
            <span className="eyebrow">Get early access</span>
            <h2 style={{ fontSize: 34, marginBottom: 12, maxWidth: "26ch" }}>
              Bring a real workflow. See what stops getting lost.
            </h2>
            <p className="lede" style={{ marginBottom: 20 }}>
              We&apos;re opening Kerniva to a small group of teams. Bring one non-confidential
              workflow and test how work moves between people and AI, without losing the research,
              reasoning, and decisions behind it.
            </p>
            <ul className="feature-list">
              {earlyAccessPoints.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <WaitlistForm />
        </div>
      </section>

      <section className="section section--subtle">
        <div className="container">
          <span className="eyebrow">Why Kerniva</span>
          <h2 style={{ fontSize: 34, marginBottom: 40, maxWidth: "24ch" }}>
            Most AI tools are single-player and ungoverned. Serious work is neither.
          </h2>
          <div className="grid grid--3">
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
            <h2>A project is the unit of work, and the unit of trust.</h2>
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
          <span className="eyebrow">Built for analysts</span>
          <div className="grid grid--2" style={{ marginTop: 8 }}>
            {audiences.map((a) => (
              <div className={`card${a.brand ? " card--brand" : ""}`} key={a.title}>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
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
              <span>controlled gateway for all AI model traffic</span>
            </div>
            <div className="stat">
              <strong>0</strong>
              <span>prompts, sources, or responses retained in telemetry</span>
            </div>
            <div className="stat">
              <strong>100%</strong>
              <span>of AI-generated changes require human approval</span>
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
        <span className="sim__badge">Market entry: DACH</span>
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
            <strong>Go/No-Go Brief: DACH market entry (v1)</strong>
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
    ["14:02:11", "session.started", "a.rahman", "sandbox project"],
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
