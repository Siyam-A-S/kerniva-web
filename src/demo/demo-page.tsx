import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from "react";
import {
  clock,
  initialWorkspace,
  nextId,
  runAgent,
  suggestions,
  tierMax,
  type Artifact,
  type Event,
  type Project,
  type Proposal,
  type Tier,
  type Workspace,
} from "./model";

type View = "relay" | "library" | "artifacts" | "proposals" | "cockpit";

type Action =
  | { type: "switch"; projectId: string }
  | { type: "send"; text: string }
  | { type: "agent"; text: string; proposal?: Omit<Proposal, "id" | "status"> }
  | { type: "decide"; proposalId: string; status: "approved" | "rejected" }
  | { type: "setTier"; tier: Tier }
  | { type: "handoff" }
  | { type: "reset" };

function append(p: Project, type: string, actor: string, detail: string): Event[] {
  const last = p.events[p.events.length - 1];
  return [...p.events, { seq: (last?.seq ?? 0) + 1, at: clock(), type, actor, detail }];
}

function updateActive(ws: Workspace, fn: (p: Project) => Project): Workspace {
  return {
    ...ws,
    projects: ws.projects.map((p) => (p.id === ws.activeProjectId ? fn(p) : p)),
  };
}

function reducer(ws: Workspace, a: Action): Workspace {
  switch (a.type) {
    case "reset":
      return initialWorkspace();
    case "switch":
      return { ...ws, activeProjectId: a.projectId };
    case "setTier":
      return updateActive(ws, (p) => ({
        ...p,
        maxTier: a.tier,
        events: append(p, "policy.updated", "you", `max tier in context → ${a.tier}`),
      }));
    case "handoff": {
      return updateActive(ws, (p) => {
        const next = p.driver === "You" ? (p.collaborators[0] ?? "You") : "You";
        return {
          ...p,
          driver: next,
          messages: [
            ...p.messages,
            {
              id: nextId("m"),
              who: "system",
              text: `Execution lease handed to ${next} (redaction consent recorded).`,
            },
          ],
          events: append(p, "lease.transferred", "you", `→ ${next}`),
        };
      });
    }
    case "send":
      return updateActive(ws, (p) => ({
        ...p,
        messages: [...p.messages, { id: nextId("m"), who: "you", text: a.text }],
        events: append(p, "transcript.appended", "you", a.text.slice(0, 48)),
      }));
    case "agent": {
      return updateActive(ws, (p) => {
        const proposal: Proposal | undefined = a.proposal
          ? { ...a.proposal, id: nextId("prop"), status: "pending" }
          : undefined;
        let events = append(
          p,
          "grounding.resolved",
          "agent",
          `${a.proposal?.sources.length ?? 0} sources`,
        );
        if (proposal) {
          events = [
            ...events,
            {
              seq: events.length + 1,
              at: clock(),
              type: `${proposal.kind}.proposed`,
              actor: "agent",
              detail: proposal.title,
            },
          ];
        }
        return {
          ...p,
          messages: [...p.messages, { id: nextId("m"), who: "agent", text: a.text }],
          proposals: proposal ? [proposal, ...p.proposals] : p.proposals,
          events,
        };
      });
    }
    case "decide":
      return updateActive(ws, (p) => {
        const prop = p.proposals.find((x) => x.id === a.proposalId);
        if (!prop || prop.status !== "pending") return p;
        const artifacts =
          a.status === "approved" && prop.artifact ? [prop.artifact, ...p.artifacts] : p.artifacts;
        let events = append(p, `proposal.${a.status}`, "you", prop.title);
        if (a.status === "approved") {
          events = [
            ...events,
            {
              seq: events.length + 1,
              at: clock(),
              type: prop.artifact ? "artifact.committed" : `${prop.kind}.committed`,
              actor: "system",
              detail: prop.title,
            },
            {
              seq: events.length + 2,
              at: clock(),
              type: "projection.rebuilt",
              actor: "system",
              detail: "read-models",
            },
          ];
        }
        return {
          ...p,
          proposals: p.proposals.map((x) =>
            x.id === a.proposalId ? { ...x, status: a.status } : x,
          ),
          artifacts,
          messages: [
            ...p.messages,
            { id: nextId("m"), who: "system", text: `${prop.title}: ${a.status}.` },
          ],
          events,
        };
      });
  }
}

export function DemoPage() {
  const [ws, dispatch] = useReducer(reducer, undefined, initialWorkspace);
  const [view, setView] = useState<View>("relay");
  const [thinking, setThinking] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const project = useMemo(
    () => ws.projects.find((p) => p.id === ws.activeProjectId) ?? ws.projects[0]!,
    [ws],
  );
  const pending = project.proposals.filter((p) => p.status === "pending").length;

  useEffect(() => {
    document.title = "Live simulation | Kerniva";
  }, []);

  function ask(text: string) {
    if (!text.trim() || thinking) return;
    dispatch({ type: "send", text });
    setThinking(true);
    const turn = runAgent(project, text);
    window.setTimeout(() => {
      const payload: Action = turn.proposal
        ? { type: "agent", text: turn.reply, proposal: turn.proposal }
        : { type: "agent", text: turn.reply };
      dispatch(payload);
      setThinking(false);
      if (turn.proposal) setView("relay");
    }, 900);
  }

  return (
    <div className="sim">
      <div className="sim__topbar">
        <strong>Project</strong>
        <select
          value={ws.activeProjectId}
          onChange={(e) => {
            dispatch({ type: "switch", projectId: e.target.value });
            setSelectedArtifact(null);
          }}
        >
          {ws.projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="sim__badge">Simulation</span>
        <span className="spacer" />
        <small>
          Driver: <strong>{project.driver}</strong> · {project.collaborators.length} collaborator
          {project.collaborators.length === 1 ? "" : "s"}
        </small>
        <button
          className="btn btn--secondary btn--sm"
          onClick={() => dispatch({ type: "handoff" })}
        >
          Hand off lease
        </button>
        <button className="btn btn--ghost btn--sm" onClick={() => dispatch({ type: "reset" })}>
          Reset
        </button>
      </div>

      <div className="sim__body">
        <aside className="sim__rail">
          <h5>Workspace</h5>
          <RailButton v="relay" cur={view} set={setView} label="Relay" />
          <RailButton v="library" cur={view} set={setView} label="Library" />
          <RailButton
            v="artifacts"
            cur={view}
            set={setView}
            label="Artifacts"
            count={project.artifacts.length}
          />
          <h5>Governance</h5>
          <RailButton v="proposals" cur={view} set={setView} label="Proposals" count={pending} />
          <RailButton v="cockpit" cur={view} set={setView} label="Cockpit" />
        </aside>

        <div className="sim__main">
          {view === "relay" && (
            <RelayView
              project={project}
              thinking={thinking}
              onAsk={ask}
              onDecide={(id, s) => dispatch({ type: "decide", proposalId: id, status: s })}
            />
          )}
          {view === "library" && <LibraryView project={project} />}
          {view === "artifacts" && (
            <ArtifactsView
              project={project}
              selected={selectedArtifact}
              onSelect={setSelectedArtifact}
            />
          )}
          {view === "proposals" && (
            <ProposalsView
              project={project}
              onDecide={(id, s) => dispatch({ type: "decide", proposalId: id, status: s })}
            />
          )}
          {view === "cockpit" && (
            <CockpitView project={project} onTier={(t) => dispatch({ type: "setTier", tier: t })} />
          )}
        </div>

        <aside className="sim__inspector">
          <h3>Policy envelope</h3>
          <div className="panel">
            <div className="row row--between">
              <span>Model egress</span>
              <small>AI gateway · zero retention</small>
            </div>
            <div className="row row--between" style={{ marginTop: 8 }}>
              <span>Max tier in context</span>
              <TierBadge tier={project.maxTier} />
            </div>
            <div className="row row--between" style={{ marginTop: 8 }}>
              <span>Agent writes</span>
              <small>Propose only</small>
            </div>
          </div>
          <h3>Event log</h3>
          <div className="panel" style={{ maxHeight: "40vh", overflowY: "auto" }}>
            {[...project.events].reverse().map((e) => (
              <div className="event" key={e.seq}>
                <time>{e.at}</time>
                <span>
                  <code>{e.type}</code>{" "}
                  <small>
                    · {e.actor} · {e.detail}
                  </small>
                </span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function RailButton({
  v,
  cur,
  set,
  label,
  count,
}: {
  v: View;
  cur: View;
  set: (v: View) => void;
  label: string;
  count?: number;
}) {
  return (
    <button className={cur === v ? "active" : ""} onClick={() => set(v)}>
      {label}
      {count ? (
        <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--brand-a)" }}>{count}</span>
      ) : null}
    </button>
  );
}

function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`tier tier--${tier}`}>{tier}</span>;
}

function RelayView({
  project,
  thinking,
  onAsk,
  onDecide,
}: {
  project: Project;
  thinking: boolean;
  onAsk: (t: string) => void;
  onDecide: (id: string, s: "approved" | "rejected") => void;
}) {
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [project.messages.length, thinking]);
  const latest = project.proposals.find((p) => p.status === "pending");

  function submit(e: FormEvent) {
    e.preventDefault();
    onAsk(text);
    setText("");
  }
  return (
    <>
      <div className="row row--between">
        <h2>Relay: work session</h2>
        <small>Append-only transcript · AI is not in the send path</small>
      </div>
      <div className="panel panel--flat">
        <div className="transcript">
          {project.messages.map((m) => (
            <div className={`msg msg--${m.who}`} key={m.id}>
              <span className="msg__who">
                {m.who === "you"
                  ? "You"
                  : m.who === "agent"
                    ? "Kerniva · agent (proposal)"
                    : m.who === "collaborator"
                      ? "Collaborator"
                      : "System"}
              </span>
              <div className="msg__body">{m.text}</div>
            </div>
          ))}
          {thinking && (
            <div className="msg msg--system">
              <div className="msg__body">Agent is grounding in the project library…</div>
            </div>
          )}
          {latest && !thinking && <ProposalCard p={latest} onDecide={onDecide} />}
          <div ref={endRef} />
        </div>
        <div className="chips">
          {suggestions[project.domain].map((s) => (
            <button className="chip" key={s} onClick={() => onAsk(s)} disabled={thinking}>
              {s}
            </button>
          ))}
        </div>
        <form className="composer" onSubmit={submit}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              project.driver === "You"
                ? "Ask the agent or message your collaborators…"
                : `${project.driver} holds the lease. You can still read and propose.`
            }
            disabled={thinking}
          />
          <button className="btn btn--primary btn--sm" type="submit" disabled={thinking}>
            Send
          </button>
        </form>
      </div>
    </>
  );
}

function ProposalCard({
  p,
  onDecide,
}: {
  p: Proposal;
  onDecide: (id: string, s: "approved" | "rejected") => void;
}) {
  return (
    <div className={`proposal proposal--${p.status}`}>
      <span className="proposal__kind">{p.kind} proposal</span>
      <strong>{p.title}</strong>
      <small>{p.summary}</small>
      <small>Sources: {p.sources.join(" · ")}</small>
      {p.status === "pending" ? (
        <div className="proposal__actions">
          <button className="btn btn--primary btn--sm" onClick={() => onDecide(p.id, "approved")}>
            Approve
          </button>
          <button className="btn btn--secondary btn--sm" onClick={() => onDecide(p.id, "rejected")}>
            Reject
          </button>
        </div>
      ) : (
        <small style={{ textTransform: "capitalize" }}>{p.status}</small>
      )}
    </div>
  );
}

function LibraryView({ project }: { project: Project }) {
  return (
    <>
      <div className="row row--between">
        <h2>Library</h2>
        <small>verified → extracted → graphed · audience view for your role</small>
      </div>
      <div className="panel panel--flat">
        {project.assets.map((a) => {
          const visible = tierMax(a.tier, project.maxTier) === project.maxTier;
          return (
            <div className="list-row" key={a.id} style={{ opacity: visible ? 1 : 0.55 }}>
              <div>
                <div>{a.title}</div>
                <small>
                  {a.kind.toUpperCase()} · {a.state}
                  {!visible && " · excluded from AI context by policy"}
                </small>
              </div>
              <TierBadge tier={a.tier} />
              <div className="progress" style={{ width: 80 }}>
                <i
                  style={{
                    width: a.state === "graphed" ? "100%" : a.state === "extracted" ? "66%" : "33%",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ArtifactsView({
  project,
  selected,
  onSelect,
}: {
  project: Project;
  selected: Artifact | null;
  onSelect: (a: Artifact | null) => void;
}) {
  const current =
    selected && project.artifacts.some((a) => a.id === selected.id)
      ? selected
      : (project.artifacts[0] ?? null);
  return (
    <>
      <div className="row row--between">
        <h2>Artifacts</h2>
        <small>Committed outputs with provenance</small>
      </div>
      {project.artifacts.length === 0 ? (
        <div className="panel">
          <p>
            No artifacts yet. Ask the agent for a brief, deck, review, or chapter in Relay, then
            approve the proposal.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14 }}>
          <div className="panel panel--flat">
            {project.artifacts.map((a) => (
              <div
                className="list-row"
                key={a.id}
                style={{
                  gridTemplateColumns: "1fr",
                  cursor: "pointer",
                  background: current?.id === a.id ? "var(--accent-soft)" : undefined,
                }}
                onClick={() => onSelect(a)}
              >
                <div>
                  <div>{a.title}</div>
                  <small>{a.format}</small>
                </div>
              </div>
            ))}
          </div>
          {current && (
            <div className="panel artifact">
              <div className="row row--between">
                <h2 style={{ fontSize: 16 }}>{current.title}</h2>
                <TierBadge tier={current.maxTier} />
              </div>
              {current.sections.map((s) => (
                <div key={s.heading}>
                  <h4>{s.heading}</h4>
                  <ul>
                    {s.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
              <h4>Provenance</h4>
              <small>{current.sources.join(" · ")}</small>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn--secondary btn--sm" disabled>
                  Export DOCX
                </button>
                <button className="btn btn--secondary btn--sm" disabled>
                  Export PPTX
                </button>
                <small>Exports are disabled in the simulation.</small>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ProposalsView({
  project,
  onDecide,
}: {
  project: Project;
  onDecide: (id: string, s: "approved" | "rejected") => void;
}) {
  return (
    <>
      <div className="row row--between">
        <h2>Proposal inbox</h2>
        <small>Agents propose · the driver decides</small>
      </div>
      {project.proposals.length === 0 ? (
        <div className="panel">
          <p>No proposals yet. Start a conversation in Relay.</p>
        </div>
      ) : (
        project.proposals.map((p) => <ProposalCard key={p.id} p={p} onDecide={onDecide} />)
      )}
    </>
  );
}

function CockpitView({ project, onTier }: { project: Project; onTier: (t: Tier) => void }) {
  const counts = {
    pending: project.proposals.filter((p) => p.status === "pending").length,
    approved: project.proposals.filter((p) => p.status === "approved").length,
    rejected: project.proposals.filter((p) => p.status === "rejected").length,
  };
  return (
    <>
      <div className="row row--between">
        <h2>Cockpit</h2>
        <small>Policy envelope · stage graph · projection integrity</small>
      </div>
      <div className="grid grid--3" style={{ gap: 14 }}>
        <div className="panel">
          <h3>Proposals</h3>
          <div className="stats" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginTop: 10 }}>
            <div className="stat">
              <strong>{counts.pending}</strong>
              <span>pending</span>
            </div>
            <div className="stat">
              <strong>{counts.approved}</strong>
              <span>approved</span>
            </div>
            <div className="stat">
              <strong>{counts.rejected}</strong>
              <span>rejected</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <h3>Max sensitivity tier in AI context</h3>
          <p style={{ margin: "8px 0 10px" }}>
            <small>
              Raising the tier lets the agent ground in more sensitive assets. Every change is
              logged.
            </small>
          </p>
          <div className="row">
            {(["general", "restricted", "privileged"] as Tier[]).map((t) => (
              <button
                key={t}
                className={`btn btn--sm ${project.maxTier === t ? "btn--primary" : "btn--secondary"}`}
                onClick={() => onTier(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Projection integrity</h3>
          <p style={{ margin: "8px 0" }}>
            <small>
              {project.events.length} events · {project.artifacts.length} artifacts materialized
            </small>
          </p>
          <div className="progress">
            <i style={{ width: "100%" }} />
          </div>
          <small style={{ color: "var(--ok)" }}>Read-models match the event log.</small>
        </div>
      </div>
      <div className="panel">
        <h3>Stage graph</h3>
        <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
          {["Consolidate sources", "Draft", "Review", "Finalize", "Hand off"].map((s, i) => (
            <span
              key={s}
              className="chip"
              style={{
                cursor: "default",
                color: i === 1 ? "var(--brand-a)" : undefined,
                borderColor: i === 1 ? "var(--brand-a)" : undefined,
              }}
            >
              {i + 1}. {s}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
