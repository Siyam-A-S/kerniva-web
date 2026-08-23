/*
 * A lightweight, fully client-side simulation of the Kerniva workspace.
 * It mirrors the product's core rule: the event log is truth, every view is a
 * projection of it, and agents only ever *propose*. No network, no model.
 */

export type Tier = "general" | "restricted" | "privileged";

export type Asset = {
  id: string;
  title: string;
  kind: "pdf" | "docx" | "xlsx" | "notes";
  tier: Tier;
  state: "verified" | "extracted" | "graphed";
};

export type Message = {
  id: string;
  who: "you" | "agent" | "system" | "collaborator";
  text: string;
};

export type Proposal = {
  id: string;
  kind: "decision" | "plan" | "task" | "artifact";
  title: string;
  summary: string;
  sources: string[];
  status: "pending" | "approved" | "rejected";
  artifact?: Artifact;
};

export type Artifact = {
  id: string;
  title: string;
  format: "brief" | "deck" | "review" | "chapter";
  sections: { heading: string; bullets: string[] }[];
  sources: string[];
  maxTier: Tier;
};

export type Event = {
  seq: number;
  at: string;
  type: string;
  actor: string;
  detail: string;
};

export type Project = {
  id: string;
  name: string;
  domain: "enterprise" | "research";
  driver: string;
  collaborators: string[];
  assets: Asset[];
  messages: Message[];
  proposals: Proposal[];
  artifacts: Artifact[];
  events: Event[];
  maxTier: Tier;
};

export type Workspace = {
  projects: Project[];
  activeProjectId: string;
};

const tierRank: Record<Tier, number> = { general: 0, restricted: 1, privileged: 2 };

export function tierMax(a: Tier, b: Tier): Tier {
  return tierRank[a] >= tierRank[b] ? a : b;
}

let counter = 100;
export function nextId(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}`;
}

export function clock() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

export function initialWorkspace(): Workspace {
  const dach: Project = {
    id: "p-dach",
    name: "Market entry — DACH",
    domain: "enterprise",
    driver: "You",
    collaborators: ["M. Keller", "S. Okafor"],
    maxTier: "restricted",
    assets: [
      {
        id: "a1",
        title: "Board memo Q2 — expansion options",
        kind: "docx",
        tier: "general",
        state: "graphed",
      },
      {
        id: "a2",
        title: "Analyst report — DACH SaaS landscape (Berger)",
        kind: "pdf",
        tier: "general",
        state: "graphed",
      },
      { id: "a3", title: "Pricing model v3", kind: "xlsx", tier: "restricted", state: "graphed" },
      {
        id: "a4",
        title: "Acquisition target shortlist",
        kind: "docx",
        tier: "privileged",
        state: "graphed",
      },
    ],
    messages: [
      { id: "m1", who: "collaborator", text: "M. Keller joined the session." },
      {
        id: "m2",
        who: "system",
        text: "You hold the execution lease. Agents may propose; only you can approve.",
      },
    ],
    proposals: [],
    artifacts: [],
    events: [
      {
        seq: 1,
        at: "09:00:02",
        type: "project.created",
        actor: "you",
        detail: "Market entry — DACH",
      },
      { seq: 2, at: "09:00:40", type: "asset.graphed", actor: "worker", detail: "4 assets" },
      { seq: 3, at: "09:01:10", type: "session.started", actor: "you", detail: "lease → you" },
    ],
  };

  const thesis: Project = {
    id: "p-thesis",
    name: "PhD thesis — Federated learning privacy",
    domain: "research",
    driver: "You",
    collaborators: ["Prof. L. Andersson (supervisor)"],
    maxTier: "restricted",
    assets: [
      {
        id: "r1",
        title: "McMahan et al. 2017 — Communication-efficient learning",
        kind: "pdf",
        tier: "general",
        state: "graphed",
      },
      {
        id: "r2",
        title: "Abadi et al. 2016 — Deep learning with differential privacy",
        kind: "pdf",
        tier: "general",
        state: "graphed",
      },
      {
        id: "r3",
        title: "Kairouz et al. 2021 — Advances and open problems in FL",
        kind: "pdf",
        tier: "general",
        state: "graphed",
      },
      {
        id: "r4",
        title: "Experiment notebook — clinical partner data",
        kind: "notes",
        tier: "restricted",
        state: "extracted",
      },
      {
        id: "r5",
        title: "Chapter 2 draft (supervisor comments)",
        kind: "docx",
        tier: "general",
        state: "graphed",
      },
    ],
    messages: [
      { id: "m1", who: "collaborator", text: "Prof. L. Andersson joined as reviewer." },
      {
        id: "m2",
        who: "system",
        text: "You hold the execution lease. Supervisor has approval rights on chapter artifacts.",
      },
    ],
    proposals: [],
    artifacts: [],
    events: [
      { seq: 1, at: "08:30:00", type: "project.created", actor: "you", detail: "PhD thesis" },
      { seq: 2, at: "08:31:12", type: "asset.graphed", actor: "worker", detail: "4 of 5 assets" },
      { seq: 3, at: "08:32:00", type: "session.started", actor: "you", detail: "lease → you" },
    ],
  };

  return { projects: [dach, thesis], activeProjectId: dach.id };
}

/* ---------- Scripted agent ---------- */

export const suggestions: Record<Project["domain"], string[]> = {
  enterprise: [
    "Draft a go/no-go brief for DACH entry",
    "Build a 6-slide board deck from the brief",
    "Summarize the analyst report",
    "Plan the next two weeks",
  ],
  research: [
    "Write a literature review on DP in federated learning",
    "Draft the methodology section",
    "Make a gap analysis from the three papers",
    "Plan the next two weeks",
  ],
};

type AgentTurn = {
  reply: string;
  proposal?: Omit<Proposal, "id" | "status">;
  touches: Asset[];
};

export function runAgent(project: Project, input: string): AgentTurn {
  const q = input.toLowerCase();
  const visible = project.assets.filter((a) => tierRank[a.tier] <= tierRank[project.maxTier]);
  const hidden = project.assets.length - visible.length;
  const srcs = (ids: string[]) => visible.filter((a) => ids.includes(a.id));
  const names = (as: Asset[]) => as.map((a) => a.title);
  const maxTier = (as: Asset[]) => as.reduce<Tier>((t, a) => tierMax(t, a.tier), "general");
  const redaction = hidden
    ? ` ${hidden} asset${hidden > 1 ? "s" : ""} above the project's allowed tier ${hidden > 1 ? "were" : "was"} excluded from context.`
    : "";

  if (q.includes("plan")) {
    const s = visible.slice(0, 2);
    return {
      reply: `Proposed a two-week plan with three phases. Nothing is scheduled until you approve.${redaction}`,
      touches: s,
      proposal: {
        kind: "plan",
        title: "Two-week plan (3 phases)",
        summary:
          "Phase 1: consolidate sources · Phase 2: draft and review · Phase 3: finalize artifacts and hand off.",
        sources: names(s),
      },
    };
  }

  if (project.domain === "enterprise") {
    if (q.includes("deck") || q.includes("slide")) {
      const s = srcs(["a1", "a2", "a3"]);
      return {
        reply: `Drafted a 6-slide board deck grounded in ${s.length} sources. Slide 4 relies on the restricted pricing model and is flagged for reviewer attention.${redaction}`,
        touches: s,
        proposal: {
          kind: "artifact",
          title: "Board deck — DACH entry (6 slides)",
          summary:
            "Executive summary, market sizing, competitive map, pricing (restricted), entry options, decision ask.",
          sources: names(s),
          artifact: {
            id: nextId("art"),
            title: "Board deck — DACH entry",
            format: "deck",
            maxTier: maxTier(s),
            sources: names(s),
            sections: [
              {
                heading: "1 · Executive summary",
                bullets: [
                  "DACH is the largest adjacent SaaS market",
                  "Recommend phased entry via Germany first",
                ],
              },
              {
                heading: "2 · Market sizing",
                bullets: ["€4.1B serviceable market (Berger)", "11% CAGR through 2028"],
              },
              {
                heading: "3 · Competitive map",
                bullets: [
                  "Three incumbents, none with governance features",
                  "Price pressure in mid-market",
                ],
              },
              {
                heading: "4 · Pricing (restricted)",
                bullets: [
                  "Per-seat with usage envelope",
                  "Break-even at 140 seats per enterprise account",
                ],
              },
              {
                heading: "5 · Entry options",
                bullets: ["Direct sales + partner channel", "Local entity in Munich, Q1"],
              },
              { heading: "6 · Decision ask", bullets: ["Approve €1.8M budget and two hires"] },
            ],
          },
        },
      };
    }
    if (q.includes("summar")) {
      const s = srcs(["a2"]);
      return {
        reply:
          "Summary of the Berger analyst report: DACH SaaS spend is growing at 11% with strong demand for governed AI in regulated mid-market firms; incumbents compete on price, not control. Full summary is available as an artifact if you want one.",
        touches: s,
      };
    }
    const s = srcs(["a1", "a2", "a3"]);
    return {
      reply: `I grounded this in ${s.length} library sources (${s.filter((a) => a.tier === "general").length} general, ${s.filter((a) => a.tier !== "general").length} restricted). Proposed brief attached; section 4 references restricted pricing data and is marked for reviewer attention.${redaction}`,
      touches: s,
      proposal: {
        kind: "artifact",
        title: "Go/No-Go Brief — DACH market entry (v1)",
        summary:
          "Four-section brief with a recommendation to proceed via a phased Germany-first entry.",
        sources: names(s),
        artifact: {
          id: nextId("art"),
          title: "Go/No-Go Brief — DACH market entry",
          format: "brief",
          maxTier: maxTier(s),
          sources: names(s),
          sections: [
            {
              heading: "1 · Context",
              bullets: [
                "Board asked for an expansion recommendation by end of quarter",
                "Three options evaluated: DACH, Nordics, Benelux",
              ],
            },
            {
              heading: "2 · Market",
              bullets: [
                "€4.1B serviceable market, 11% CAGR (Berger)",
                "Regulated mid-market underserved on governance",
              ],
            },
            {
              heading: "3 · Competitive position",
              bullets: [
                "No incumbent offers tiered sensitivity controls",
                "Price competition strongest below 50 seats",
              ],
            },
            {
              heading: "4 · Economics (restricted)",
              bullets: [
                "Break-even at 140 seats per account",
                "Payback inside 14 months on base case",
              ],
            },
            {
              heading: "Recommendation",
              bullets: ["Go — phased, Germany first, partner channel for Austria and Switzerland"],
            },
          ],
        },
      },
    };
  }

  // research
  if (q.includes("method")) {
    const s = srcs(["r2", "r4"]);
    return {
      reply: `Drafted the methodology section using the DP-SGD baseline and your experiment notebook. Sent to Prof. Andersson's approval queue.${redaction}`,
      touches: s,
      proposal: {
        kind: "artifact",
        title: "Chapter 3 — Methodology (draft 1)",
        summary:
          "Threat model, privacy accounting, federated training protocol, and evaluation plan.",
        sources: names(s),
        artifact: {
          id: nextId("art"),
          title: "Chapter 3 — Methodology",
          format: "chapter",
          maxTier: maxTier(s),
          sources: names(s),
          sections: [
            {
              heading: "3.1 Threat model",
              bullets: [
                "Honest-but-curious server; colluding clients bounded at k",
                "Membership inference as primary attack",
              ],
            },
            {
              heading: "3.2 Privacy accounting",
              bullets: [
                "Rényi DP composition across rounds (Abadi et al.)",
                "Target ε ≤ 4 at δ = 1e-5",
              ],
            },
            {
              heading: "3.3 Training protocol",
              bullets: [
                "FedAvg with per-client clipping and Gaussian noise",
                "Secure aggregation for update transport",
              ],
            },
            {
              heading: "3.4 Evaluation (restricted data)",
              bullets: [
                "Clinical partner cohort, n = 3 sites",
                "Utility vs. ε curves, attack success rate",
              ],
            },
          ],
        },
      },
    };
  }
  if (q.includes("gap")) {
    const s = srcs(["r1", "r2", "r3"]);
    return {
      reply:
        "Gap analysis across the three foundational papers: (1) no unified accounting across heterogeneous client participation; (2) utility loss under non-IID data is under-reported; (3) secure aggregation is rarely evaluated jointly with DP. A decision proposal is attached to adopt gap (1) as the thesis's primary contribution.",
      touches: s,
      proposal: {
        kind: "decision",
        title: "Adopt gap (1) as primary contribution",
        summary:
          "Focus the thesis on unified privacy accounting under heterogeneous participation.",
        sources: names(s),
      },
    };
  }
  const s = srcs(["r1", "r2", "r3", "r5"]);
  return {
    reply: `Literature review drafted from ${s.length} sources with inline provenance. The coverage matrix shows 12 of 14 themes addressed; two are flagged as thin.${redaction}`,
    touches: s,
    proposal: {
      kind: "artifact",
      title: "Literature review — DP in federated learning (v1)",
      summary: "Structured review with a coverage matrix and two identified gaps.",
      sources: names(s),
      artifact: {
        id: nextId("art"),
        title: "Literature review — Differential privacy in federated learning",
        format: "review",
        maxTier: maxTier(s),
        sources: names(s),
        sections: [
          {
            heading: "1 · Foundations",
            bullets: [
              "FedAvg establishes communication-efficient training (McMahan 2017)",
              "DP-SGD provides per-example guarantees (Abadi 2016)",
            ],
          },
          {
            heading: "2 · Privacy in federated settings",
            bullets: [
              "Client-level vs. example-level DP",
              "Accounting under partial participation remains open (Kairouz 2021)",
            ],
          },
          {
            heading: "3 · Coverage matrix",
            bullets: [
              "12 / 14 themes covered",
              "Thin: non-IID utility, joint secure aggregation + DP",
            ],
          },
          {
            heading: "4 · Positioning",
            bullets: ["This thesis targets unified accounting across heterogeneous participation"],
          },
        ],
      },
    },
  };
}
