import { Link } from "react-router-dom";
import type { ContactInterest, DemoTeamSize, WaitlistWork } from "../shared/forms";
import {
  AuditIcon,
  BotIcon,
  CodeIcon,
  GlobeIcon,
  IdentityIcon,
  LockIcon,
  ShieldIcon,
  TiersIcon,
} from "./components/icons";

/**
 * Every piece of user-visible prose on the site, in one place, so copy can be
 * edited without opening a component.
 *
 * Three things deliberately stay out of this module:
 *
 * - The nav and footer link tables (`site-header.tsx`, `site-footer.tsx`).
 *   Those are label plus href routing tables rendered by three different link
 *   components, not prose.
 * - The partner marks in `backers.tsx`, whose names are inline SVG live text
 *   and, for Google, one glyph per brand colour. The copy is fused to styling.
 * - `aria-label`, `alt`, and `role` strings, which belong next to the element
 *   they describe.
 *
 * Two conventions worth keeping:
 *
 * - The literal arrays are `as const` because several consumers branch on a
 *   field that only one element has (`"solid" in step`, `"active" in item`,
 *   `"src" in tool`). Annotating those fields as optional instead would make
 *   the `in` checks dead code.
 * - Where the landing page and a standalone page carry identical wording, one
 *   const is shared and both import it, so editing it changes both surfaces.
 *   Where the wording already differs (usually a trailing period on the page
 *   title), the two are kept separate on purpose.
 */

/* -------------------------------------------------------------- shared --- */

export const TAGLINE = "AI workspace for teams with no time to lose";

/** Also in `index.html`'s <title> and og tags, which this module cannot reach. */
export const TITLE_HOME = "Kerniva: AI workspace for teams with no time to lose";
export const TITLE_DEMO = "Book a demo | Kerniva";

/**
 * The three public addresses are Google Groups, not per-person aliases, so
 * membership can change without the published address changing. They are
 * defined in `shared/forms.ts`, which the API imports too, and re-exported
 * here so page code has one place to look.
 */
export { EMAIL_CONTACT, EMAIL_SALES, EMAIL_SECURITY, EMAIL_SUPPORT } from "../shared/forms";

export const BTN_BOOK_DEMO = "Book a demo";
export const BTN_JOIN_WAITLIST = "Join the waitlist";
export const BTN_TALK_TO_SALES = "Talk to sales";

export const CTA_DEFAULT = {
  title: "Kerniva is best experienced with real work",
  body: "See how Kerniva fits your team’s material and workflow through a tailored session, or explore a live workspace when early access opens.",
} as const;

export const CTA_RESEARCH = {
  title: "Bring Kerniva to your department",
  body: "We work with research offices and graduate schools on institutional deployments with SSO and data residency.",
} as const;

export const CTA_SECURITY = {
  title: "Request the security package",
  body: "Architecture overview, data-flow diagrams, and questionnaire responses for your review.",
} as const;

/* ---------------------------------------------------------------- hero --- */

export const HOME_HERO = {
  /** Two lines, because each is animated separately. */
  line1: "The AI workspace for teams",
  line2: "with no time to lose",
  lede: "Kerniva connects your team’s research, files, AI sessions, and project decisions in real time, so the next collaborator can continue without reconstructing context.",
  primary: "Join the design-partner program",
  secondary: "See how it works",
} as const;

/* -------------------------------------------------------- product mock --- */

/**
 * Must stay a module-level binding: `useTypewriter` restarts its effect if the
 * array identity changes, so never spread or map this at the call site.
 */
export const HOME_TYPE_PHRASES = [
  "Summarizing yesterday’s session for handoff…",
  "Linking pricing_v3.fig to Decision #12…",
  "Drafting a starting point for Maya…",
  "Connecting competitor scan to the open question…",
] as const;

export const HOME_TIMELINE = [
  { title: "Decision logged · ship variant B", meta: "Maya · 2m ago" },
  { title: "File linked · pricing_v3.fig", meta: "Jon · 14m ago" },
  { title: "Research added · competitor scan", meta: "Kerniva · 1h ago" },
  { title: "Session summarized for handoff", meta: "Kerniva · 2h ago" },
] as const;

export const HOME_RAIL = [
  { label: "Overview", count: "" },
  { label: "Research", count: "12" },
  { label: "Files", count: "34" },
  { label: "AI sessions", count: "8", active: true },
  { label: "Decisions", count: "5" },
] as const;

export const HOME_MOCK = {
  chipTitle: "Handoff ready",
  chipNote: "nothing to reconstruct",
  project: "Project · Atlas launch",
  liveTag: "Live",
  avatars: ["MK", "JT", "+3"],
  railLabel: "Workspace",
  sessionTitle: "AI session · Pricing-page rewrite",
  sharedTag: "shared with team",
  liveLabel: "Kerniva · live",
  composer: "Continue this session…",
  send: "↵ send",
  timelineLabel: "Context timeline",
  status: "Context: 27 sources connected · synced 4s ago",
  statusEnd: "Everything above stays attached to the project",
} as const;

/* ------------------------------------------------------- how it works --- */

export const HOME_HOW = {
  eyebrow: "02 · How it works",
  title: "Work once. Hand it off in minutes, not meetings.",
  watch: "Watch it work",
  watchNote: "See a handoff happen end to end · 45 sec",
  eventLabel: "Context event",
} as const;

export const HOME_STEPS = [
  {
    n: "01",
    title: "The team works",
    body: "Research, files, AI sessions, and decisions happen where they always do: inside the project.",
  },
  {
    n: "02",
    title: "Kerniva connects it",
    body: "Every artifact is linked to the project in real time: who made it, why, and what it changed.",
  },
  {
    n: "03",
    title: "A teammate opens it",
    body: "The next collaborator sees the full state of the project: not a folder, a trail.",
  },
  {
    n: "04",
    title: "Work continues",
    body: "No reconstructing context, no re-asking, no starting over. They pick up mid-thought.",
    solid: true,
  },
] as const;

export const HOME_EVENTS = [
  {
    at: "now",
    title: "AI session linked to Atlas launch",
    note: "visible to the whole team instantly",
  },
  {
    at: "2m",
    title: "Decision recorded with its evidence",
    note: "the “why” travels with the “what”",
  },
  {
    at: "9m",
    title: "Research attached to the open question",
    note: "no more “where did we see that?”",
  },
  { at: "14m", title: "Handoff summary drafted for Maya", note: "she starts where Jon stopped" },
] as const;

/* ------------------------------------------------------- integrations --- */

export const HOME_INTEGRATIONS = {
  eyebrow: "03 · Integrations",
  title: "Kerniva connects to the tools your team already uses",
  lede: "Context moves into your existing workflow: research, files, sessions, and decisions arrive with the evidence your team needs to act.",
} as const;

/** Slack has no `src` on purpose: it is drawn as inline SVG. */
export const TOOLS = [
  { name: "Slack" },
  { name: "GitHub", src: "/logos/github.svg" },
  { name: "Notion", src: "/logos/notion.svg" },
  { name: "Linear", src: "/logos/linear.svg" },
  { name: "Google Drive", src: "/logos/googledrive.svg" },
  { name: "Figma", src: "/logos/figma.svg" },
  { name: "Jira", src: "/logos/jira.svg" },
  { name: "Gmail", src: "/logos/gmail.svg" },
  { name: "Dropbox", src: "/logos/dropbox.svg" },
  { name: "Claude", src: "/logos/claude.svg" },
] as const;

/* ------------------------------------------------------------ research --- */

/** Shared by the landing section and `/research`. */
export const RESEARCH_LEDE =
  "For labs, supervisors, and graduate students: a project library that grows into a knowledge graph, AI that cites what it reads, and supervisor approval built into the workflow.";

export const RESEARCH_INTEGRITY_LEDE =
  "Institutions are asking how AI was used. Kerniva answers that question with the event log: which sources were in context, which skill produced the draft, which model was used, and who approved it.";

export const RESEARCH_ARTIFACTS_TITLE = "Artifacts researchers generate";

export const RESEARCH_STEPS = [
  {
    n: "01",
    title: "Build the library",
    body: "Drop in papers, datasets, notes, and prior drafts. Each source is extracted, embedded, and graphed so relationships between concepts, authors, and claims become navigable.",
  },
  {
    n: "02",
    title: "Work the thesis",
    body: "Run literature reviews, gap analyses, and argument maps in a Relay session with your supervisor. Every claim in a draft links back to the passage it came from.",
  },
  {
    n: "03",
    title: "Generate and defend",
    body: "Produce chapters, abstracts, slide decks, and reviewer responses as governed artifacts. Supervisors approve; the record shows what was AI-assisted and what was not.",
    solid: true,
  },
] as const;

export const INTEGRITY = [
  "Citation-preserving drafts with inline provenance",
  "Graphify-powered concept graph across the whole library",
  "Supervisor and committee roles with approval rights",
  "Exportable audit trail for ethics and integrity offices",
] as const;

export const ARTIFACTS = [
  "Structured literature review with coverage matrix",
  "Research proposal and methodology section",
  "Chapter drafts with tracked claims",
  "Conference deck and poster outline",
  "Reviewer response letters",
] as const;

export const HOME_RESEARCH = {
  eyebrow: "04 · Research and thesis",
  title: "Long-form research with a shared brain and real review gates",
  integrityTitle: "Integrity by construction",
  plateRef: "KV-R1",
} as const;

/* ------------------------------------------------------------ security --- */

/** Shared by the landing section and `/security`. */
export const SECURITY_LEDE =
  "Kerniva is designed so that the safe path is the only path: secrets never reach clients, agents never write canonical state, and the model only sees what the person asking is allowed to see.";

export const SECURITY_COMPLIANCE_BODY =
  "We complete SIG and CAIQ questionnaires and provide architecture walkthroughs for enterprise security reviews.";

/**
 * The landing cards and the `/security` table say the same things, but two
 * titles differ ("and" here, "&" on the page), so the two lists are kept apart
 * rather than merged. Edit both when a control changes.
 */
export const HOME_SECURITY_CARDS = [
  {
    Icon: IdentityIcon,
    title: "Identity",
    body: "AWS Cognito with SSO (SAML / OIDC), enforced MFA, and short-lived tokens. Refresh tokens never reach the browser.",
  },
  {
    Icon: LockIcon,
    title: "Authorization",
    body: "RBAC plus attribute-based policies evaluated server-side; tenant isolation enforced by forced PostgreSQL row-level security.",
  },
  {
    Icon: ShieldIcon,
    title: "Data in transit and at rest",
    body: "TLS 1.3 everywhere; S3, RDS, and queues encrypted with customer-managed KMS keys.",
  },
  {
    Icon: BotIcon,
    title: "AI data handling",
    body: "Single-egress AI gateway with zero-retention agreements. Prompts, sources, and model responses are excluded from logs and telemetry.",
  },
  {
    Icon: TiersIcon,
    title: "Sensitivity tiers",
    body: "General, restricted, and privileged tiers on every asset; audience views materialized per role with silent redaction.",
  },
  {
    Icon: AuditIcon,
    title: "Audit",
    body: "Append-only, tamper-evident event log with hash chaining and SIEM export.",
  },
  {
    Icon: CodeIcon,
    title: "Application security",
    body: "OWASP Top 10 program, strict CSP and secure headers, secrets in AWS Secrets Manager, dependency and container scanning in CI.",
  },
  {
    Icon: GlobeIcon,
    title: "Residency and isolation",
    body: "Deploy in your AWS region or your own account. Nonproduction and production live in independent accounts with separate state.",
  },
] as const;

export const HOME_SECURITY = {
  eyebrow: "05 · Security",
  title: "Security is the product, not a page",
  complianceLabel: "Compliance · Evidence on request",
} as const;

/* ------------------------------------------------------------- company --- */

/** Shared by the landing section and `/about`. */
export const COMPANY_LEDE =
  "Kerniva started from a simple observation: the teams with the most to gain from AI are the ones least able to use consumer tools. We are building the workspace they can actually adopt.";

export const COMPANY_WHERE =
  "Kerniva is in private beta with design partners in enterprise strategy, advisory, and academic research. Production deployments run on AWS with manual release gates.";

export const COMPANY_HIRING =
  "We are hiring engineers who care about governance, security, and the craft of dense, quiet interfaces.";

export const PRINCIPLES = [
  "Humans decide; agents propose",
  "The event log is the truth",
  "The safe path is the only path",
] as const;

export const HOME_COMPANY = {
  eyebrow: "06 · Company",
  title: "We build AI tools for the work that cannot leak",
  principlesTitle: "Principles",
  whereTitle: "Where we are",
  hiringTitle: "Work with us",
} as const;

/* ----------------------------------------------------------------- faq --- */

export const HOME_FAQ_EYEBROW = "07 · Questions";

/** No `as const`: the answers are JSX, and one of them carries a router link. */
export const FAQ = [
  {
    q: "What counts as “context” in Kerniva?",
    a: (
      <>
        Research, files, AI sessions, and project decisions, connected to the project in real time.
        Anything a collaborator would otherwise have to reconstruct stays attached to the work it
        belongs to.
      </>
    ),
  },
  {
    q: "Does my team have to change how it works?",
    a: (
      <>
        No. The team keeps researching, deciding, and running AI sessions the way it already does.
        Kerniva does the connecting, so the next collaborator can continue without starting over.
      </>
    ),
  },
  {
    q: "How is this different from a shared drive or wiki?",
    a: (
      <>
        Drives store artifacts; wikis store write-ups someone had to remember to write. Kerniva
        keeps the live trail (what was made, by whom, why, and what decision it fed) without asking
        anyone to document it after the fact.
      </>
    ),
  },
  {
    q: "How do we get started?",
    a: (
      <>
        Join the waitlist for a workspace of your own, or <Link to="/demo">book a demo</Link> and we
        will walk through it on your team’s real work in 30 minutes.
      </>
    ),
  },
];

/* ----------------------------------------------------------- next step --- */

export const HOME_NEXT_STEP = {
  eyebrow: "08 · The next step",
  title: "See Kerniva on your team’s own work",
  lede: "A 30-minute walkthrough on a real project, or a place in the queue for a workspace of your own.",
} as const;

/* ------------------------------------------------------------- product --- */

export const PRODUCT_PAGE = {
  eyebrow: "Product",
  title: "One governed workspace for conversation, knowledge, and output.",
  lede: "Kerniva separates what people say, what the organization knows, and what the AI produces, then connects them through a single, auditable project log.",
  protocolEyebrow: "The governed protocol",
  protocolTitle: "Agents always propose. Humans decide. The log is truth.",
  skillsTitle: "Skills as execution contracts.",
  skillsBody:
    "Every capability an agent can use (summarize, draft, extract, compare, cite) is declared as a skill with explicit inputs, allowed tools, model gating, and output schema. Teams can extend the catalog; administrators decide which skills each project may run.",
  skillsPoints: [
    "Tool and model gating per skill, per project",
    "Deterministic validation before any proposal reaches a reviewer",
    "Versioned skill contracts recorded alongside every artifact",
  ],
  deploymentTitle: "Deployment model",
  deploymentBody:
    "Kerniva runs as a web workspace and a terminal CLI over the same governed HTTP API, hosted in your AWS account or ours.",
  deploymentPoints: [
    "Web app on CloudFront + S3; API on ECS Fargate",
    "PostgreSQL with forced row-level security and pgvector",
    "FIFO ingestion queue with retries and dead-letter handling",
    "Cognito for identity, SSO, and MFA",
  ],
} as const;

export const PRODUCT_SURFACES = [
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
    body: "Briefs, decks, reports, literature reviews, and chapters produced from sessions, each with provenance to sources, tiers, and the approving person. Export to DOCX, PPTX, PDF, or Markdown.",
  },
  {
    name: "Cockpit",
    tag: "Governance",
    body: "The project's control room: proposal inbox, policy envelope and throttles, stage graph, skill-as-execution-contract, explainability, and projection integrity checks.",
  },
  {
    name: "Tasks & Phases",
    tag: "Execution",
    body: "Read-models derived from the event log. Phases, tasks, reminders, and handoffs stay in sync with what was actually approved, never what an agent merely suggested.",
  },
  {
    name: "Sensitivity-aware grounding",
    tag: "Governance",
    body: "Kerniva respects who can access each source, ensuring people and AI only work with the context they’re authorized to use.",
  },
];

export const PRODUCT_STEPS = [
  ["Propose", "An agent or a collaborator proposes a decision, plan, task, or artifact."],
  [
    "Validate",
    "Policy envelope, sensitivity tiers, and skill contracts are checked automatically.",
  ],
  ["Approve", "The session driver, a human, approves, requests changes, or rejects."],
  ["Commit", "The event is appended to the project log; every projection rebuilds from it."],
];

/* ----------------------------------------------------------- solutions --- */

export const SOLUTIONS_PAGE = {
  eyebrow: "Solutions",
  title: "Built for teams where a leak is a headline.",
  lede: "Kerniva is deployed by organizations that need the productivity of AI with the control of a records system.",
} as const;

/** The ids are anchor targets linked from the footer, not copy. */
export const SOLUTIONS = [
  {
    id: "enterprise",
    title: "Enterprise knowledge teams",
    lede: "Strategy, product, and operations groups working across confidential material.",
    points: [
      "Project-scoped libraries so context never leaks between initiatives",
      "Real-time co-working with a single accountable driver",
      "Board-ready briefs and decks generated with provenance",
      "Connectors for SharePoint with ACL-suggested sensitivity",
    ],
  },
  {
    id: "legal",
    title: "Legal, audit, and compliance",
    lede: "Practices that must show exactly what the model saw and who approved the output.",
    points: [
      "Privileged tier enforced at retrieval, not by prompt instruction",
      "Tamper-evident audit trail with SIEM export",
      "Consent-to-redaction on every handoff between colleagues",
      "Security questionnaire (SIG / CAIQ) responses on request",
    ],
  },
  {
    id: "consulting",
    title: "Consulting and advisory",
    lede: "Engagement teams that produce a lot of artifacts under tight client confidentiality.",
    points: [
      "One project per engagement with its own policy envelope",
      "Proposal inbox so juniors can draft while partners decide",
      "Reusable skills for your house style of memo, model, and deck",
      "Explainability on every deliverable for client review",
    ],
  },
];

/* ------------------------------------------------------- research page --- */

export const RESEARCH_PAGE = {
  eyebrow: "Research & thesis",
  title: "Long-form research with a shared brain and real review gates.",
  integrityTitle: "Integrity by construction.",
} as const;

/* ------------------------------------------------------- security page --- */

export const SECURITY_PAGE = {
  eyebrow: "Security",
  title: "Security is the product, not a page.",
  complianceEyebrow: "Compliance",
  complianceTitle: "Evidence on request",
} as const;

export const SECURITY_CONTROLS = [
  [
    "Identity",
    "AWS Cognito with SSO (SAML / OIDC), enforced MFA, and short-lived tokens. Refresh tokens never reach the browser.",
  ],
  [
    "Authorization",
    "RBAC plus attribute-based policies evaluated server-side; tenant isolation enforced by forced PostgreSQL row-level security.",
  ],
  [
    "Data in transit & at rest",
    "TLS 1.3 everywhere; S3, RDS, and queues encrypted with customer-managed KMS keys.",
  ],
  [
    "AI data handling",
    "Single-egress AI gateway with zero-retention agreements. Prompts, sources, and model responses are excluded from logs and telemetry.",
  ],
  [
    "Sensitivity tiers",
    "General, restricted, and privileged tiers on every asset; audience views materialized per role with silent redaction.",
  ],
  ["Audit", "Append-only, tamper-evident event log with hash chaining and SIEM export."],
  [
    "Application security",
    "OWASP Top 10 program, strict CSP and secure headers, secrets in AWS Secrets Manager, dependency and container scanning in CI.",
  ],
  [
    "Residency & isolation",
    "Deploy in your AWS region or your own account. Nonproduction and production live in independent accounts with separate state.",
  ],
];

/* ------------------------------------------------------------- pricing --- */

export const PRICING_PAGE = {
  eyebrow: "Pricing",
  title: "Priced for teams, not tokens.",
  lede: "Kerniva is sold per seat with model usage included within fair-use envelopes you control per project.",
} as const;

export const PRICING_PLANS = [
  {
    name: "Team",
    price: "Contact us",
    period: "",
    blurb: "For a single group running governed projects on Kerniva-hosted AWS.",
    items: [
      "Up to 25 seats",
      "Unlimited projects",
      "Relay, Library, Artifacts",
      "SSO & MFA",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "For organizations with security review, data residency, and connector needs.",
    items: [
      "Unlimited seats",
      "Deploy in your AWS account or region",
      "SharePoint and custom connectors",
      "Audit export to your SIEM",
      "Security questionnaire & architecture review",
      "Dedicated success engineer",
    ],
    featured: true,
  },
  {
    name: "Research",
    price: "Institutional",
    period: "",
    blurb: "For departments, labs, and graduate schools.",
    items: [
      "Department-wide seats",
      "Supervisor & committee roles",
      "Integrity audit export",
      "Library connectors for repositories",
      "Onboarding for faculty",
    ],
    featured: false,
  },
];

/* --------------------------------------------------------------- about --- */

export const ABOUT_PAGE = {
  eyebrow: "Company",
  title: "We build AI tools for the work that cannot leak.",
  principlesTitle: "Principles",
  whereTitle: "Where we are",
  hiringTitle: "Work with us",
  hiringWriteTo: "Write to",
} as const;

/* ------------------------------------------------------------- privacy --- */

export const PRIVACY_PAGE = {
  eyebrow: "Privacy",
  title: "What the simulation does with your data.",
  lede: "The public simulation (currently behind a waitlist) is a real Kerniva workspace that is deliberately disposable. This note says exactly what will be stored, for how long, and who can see it when it opens.",
  enterpriseNote: "Looking for the enterprise posture: SSO, residency, audit? See",
  enterpriseLink: "Security",
} as const;

/** Keep in step with SANDBOX_PROMISE in the product monorepo's contracts. */
export const PRIVACY_POINTS: Array<[string, string]> = [
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
    "Files you upload stay in your sandbox only. They are deleted when the sandbox ends and the whole simulation (database, files, graphs) is rebuilt from scratch every night at 03:00 UTC. Please do not upload confidential material.",
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
    "Write to privacy@kerniva.app. For the product itself, hosted in your own AWS account, see the security page.",
  ],
];

/* ----------------------------------------------------------- not found --- */

export const NOT_FOUND = {
  eyebrow: "404",
  title: "That page does not exist.",
  lede: "The link may be out of date.",
  back: "Back to home",
} as const;

/* ------------------------------------------------------------- contact --- */

export const CONTACT_PAGE = {
  eyebrow: "Contact",
  title: "Talk to the team.",
  lede: "Tell us about your team, your material, and what you need to see before you can adopt an AI workspace.",
  sent: "Thank you. We will reply within two business days.",
  name: "Name",
  email: "Work email",
  org: "Organization",
  interest: "I am interested in",
  message: "Message",
  submit: "Send",
  submitting: "Sending…",
  directTitle: "Direct lines",
  salesLabel: "Sales and partnerships:",
  supportLabel: "Support:",
  securityLabel: "Security reviews:",
} as const;

/** `value` is submitted with the form; changing a label must not change it. */
export const CONTACT_INTERESTS: readonly { value: ContactInterest; label: string }[] = [
  { value: "enterprise", label: "Enterprise workspace" },
  { value: "research", label: "Research & thesis" },
  { value: "security", label: "Security review" },
  { value: "other", label: "Something else" },
];

/* ------------------------------------------------------------ waitlist --- */

export const WAITLIST_PAGE = {
  eyebrow: "Early access",
  title: "The live simulation is almost ready.",
  lede: "Try Kerniva will give you a real workspace of your own: upload a document, ask the brain, drive a Relay session, approve an artifact. We are opening it in small waves. Leave your email and you will get access in the next one.",
  getTitle: "What you will get",
  getPoints: [
    "A clean project with a sample library, just for you, no account needed",
    "The real product: Relay, Library, proposals, Cockpit, the event log",
    "A generous model budget for a full guided session",
    "Everything disposable: your sandbox is wiped when it ends",
  ],
  impatient:
    "Can't wait? A working session with the team is the fastest way to see Kerniva on your own material:",
} as const;

export const WAITLIST_FORM = {
  sent: "You are on the list. We will write to you when the simulation opens.",
  name: "Name",
  email: "Work email",
  org: "Organization",
  work: "What kind of work does your team do?",
  note: "One email when access opens. No newsletter, no sharing.",
  submitting: "Joining…",
} as const;

/** `value` is submitted with the form; changing a label must not change it. */
export const WAITLIST_WORK_KINDS: readonly { value: WaitlistWork; label: string }[] = [
  { value: "consulting", label: "Consulting and advisory" },
  { value: "research", label: "Research" },
  { value: "product", label: "Product and project work" },
  { value: "other", label: "Other" },
];

/* ---------------------------------------------------------------- demo --- */

export const DEMO_PAGE = {
  back: "← Back to site",
  waitlistInstead: "Join the waitlist instead",
  /** Two lines, because the second is styled as an accent. */
  line1: "Join the design-partner program.",
  line2: "Bring a real project.",
  lede: "Thirty minutes, on your team’s own work. We will show how research, files, AI sessions, and decisions stay connected, so the next collaborator never starts over.",
  plateTitle: "Demo request",
  plateRef: "KV-01",
  plateLength: "30 min",
  bookedTitle: "Request received",
  bookedBody:
    "Check your inbox for a calendar link. In the meantime, you can put your team in the queue for a workspace of your own.",
  backToSite: "Back to site",
  name: "Name",
  namePlaceholder: "Ada Torres",
  email: "Work email",
  emailPlaceholder: "ada@company.com",
  company: "Company",
  companyPlaceholder: "Acme Studio",
  teamSize: "Team size",
  notes: "What should we focus on?",
  notesOptional: "(optional)",
  notesPlaceholder: "e.g. handoffs between our research and design teams",
  submit: "Book my demo",
  submitting: "Sending…",
  finePrint:
    "We reply within one business day with a calendar link. No mailing list, no follow-up sequence.",
  slots: "Live slots this week · Tue to Fri, 9:00 to 17:00 CET",
} as const;

export const DEMO_PROMISES = [
  {
    n: "01",
    title: "A walkthrough, not a pitch",
    body: "We set up a workspace live and run a handoff end to end.",
  },
  {
    n: "02",
    title: "Your stack, your questions",
    body: "Tell us what your team uses and we will show how it connects.",
  },
  {
    n: "03",
    title: "Leave with a workspace",
    body: "Your trial project stays live after the call, so you can keep working in it.",
  },
] as const;

/** Each entry is both the radio's submitted value and its visible label. */
export const DEMO_TEAM_SIZES: readonly DemoTeamSize[] = ["1–10", "11–50", "51–200", "200+"];

/* --------------------------------------------------------- video modal --- */

export const VIDEO_MODAL = {
  title: "Kerniva launch film",
  ref: "KV-F1",
  close: "Close",
  missingBefore: "The launch film is not in this build yet. Add it at",
} as const;
