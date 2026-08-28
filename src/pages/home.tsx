import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Backers } from "../components/backers";
import { Blueprint, Corners } from "../components/blueprint";
import { Disclosure } from "../components/disclosure";
import { SectionLink } from "../components/section-link";
import { VideoModal } from "../components/video-modal";
import {
  ArrowRightIcon,
  PlayIcon,
  AuditIcon,
  BotIcon,
  CheckIcon,
  CodeIcon,
  GlobeIcon,
  IdentityIcon,
  LockIcon,
  ShieldIcon,
  TiersIcon,
} from "../components/icons";
import { useAutoCycle, useTypewriter } from "../components/anim";
import {
  CYCLE_ACTIVE_BG,
  CYCLE_ACTIVE_BORDER,
  CYCLE_IDLE_BG,
  CYCLE_IDLE_BORDER,
  cycleTransition,
  EASE,
  reveal,
  riseIn,
} from "../components/transitions";

const muted = (pct: number) => `color-mix(in srgb, var(--color-text) ${pct}%, transparent)`;

/* ---------------------------------------------------------------- hero --- */

/** Hairline grid, purple dashed lines scrolling by, pulsing registration crosses. */
function HeroBackdrop() {
  return (
    <motion.svg
      viewBox="0 0 1200 620"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="hero__backdrop"
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={riseIn(0.1, 1.4)}
    >
      <line x1="0" y1="90" x2="1200" y2="90" stroke="var(--color-divider)" strokeWidth="1" />
      <line x1="0" y1="210" x2="1200" y2="210" stroke="var(--color-divider)" strokeWidth="1" />
      <line x1="0" y1="330" x2="1200" y2="330" stroke="var(--color-divider)" strokeWidth="1" />
      <line x1="760" y1="0" x2="760" y2="620" stroke="var(--color-divider)" strokeWidth="1" />
      <line x1="1060" y1="0" x2="1060" y2="620" stroke="var(--color-divider)" strokeWidth="1" />
      <line
        x1="0"
        y1="90"
        x2="1200"
        y2="90"
        stroke="var(--color-accent-500)"
        strokeWidth="1"
        strokeDasharray="8 14"
        style={{ animation: "kv-dash 2.6s linear infinite", opacity: 0.55 }}
      />
      <line
        x1="0"
        y1="210"
        x2="1200"
        y2="210"
        stroke="var(--color-accent-500)"
        strokeWidth="1"
        strokeDasharray="8 18"
        style={{ animation: "kv-dash 3.8s linear infinite", opacity: 0.4 }}
      />
      <line
        x1="0"
        y1="330"
        x2="1200"
        y2="330"
        stroke="var(--color-accent-500)"
        strokeWidth="1"
        strokeDasharray="8 22"
        style={{ animation: "kv-dash 5s linear infinite", opacity: 0.3 }}
      />
      <g
        stroke="var(--color-accent-600)"
        strokeWidth="1"
        style={{ animation: "kv-pulse 3.2s ease-in-out infinite" }}
      >
        <path d="M760 82 v16 M752 90 h16" />
        <path d="M1060 202 v16 M1052 210 h16" />
      </g>
      <g
        stroke="var(--color-accent-600)"
        strokeWidth="1"
        style={{ animation: "kv-pulse 4.4s ease-in-out infinite" }}
      >
        <path d="M1060 322 v16 M1052 330 h16" />
        <path d="M760 322 v16 M752 330 h16" />
      </g>
      <rect x="0" y="0" width="1200" height="620" fill="url(#kvFade)" />
      <defs>
        <linearGradient id="kvFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="var(--color-bg)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--color-bg)" stopOpacity="1" />
        </linearGradient>
      </defs>
    </motion.svg>
  );
}

function Hero() {
  return (
    <div className="container">
      <section className="hero">
        <HeroBackdrop />
        <div className="hero__content">
          <h1 className="h-display">
            <motion.span
              style={{ display: "block" }}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={riseIn(0.15, 0.85)}
            >
              The AI workspace for teams
            </motion.span>
            <motion.span
              style={{ display: "block", color: "var(--color-accent-700)" }}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={riseIn(0.29, 0.85)}
            >
              with no time to lose
            </motion.span>
          </h1>
          <motion.p
            className="lede"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={riseIn(0.5)}
          >
            Kerniva connects your team’s research, files, AI sessions, and project decisions in real
            time, so the next collaborator can continue without reconstructing context.
          </motion.p>
          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={riseIn(0.66)}
          >
            <Link to="/demo" className="btn btn--primary btn--lg blueprint">
              <Corners />
              Join the design-partner program
            </Link>
            {/* A real anchor, so the smooth scroll comes from `scroll-behavior`
                in styles.css, which the reduced-motion block already turns off. */}
            <SectionLink hash="how" className="btn btn--secondary btn--lg">
              See how it works
              <ArrowRightIcon size={14} />
            </SectionLink>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------- product mock --- */

const TYPE_PHRASES = [
  "Summarizing yesterday’s session for handoff…",
  "Linking pricing_v3.fig to Decision #12…",
  "Drafting a starting point for Maya…",
  "Connecting competitor scan to the open question…",
] as const;

const TIMELINE = [
  { title: "Decision logged · ship variant B", meta: "Maya · 2m ago" },
  { title: "File linked · pricing_v3.fig", meta: "Jon · 14m ago" },
  { title: "Research added · competitor scan", meta: "Kerniva · 1h ago" },
  { title: "Session summarized for handoff", meta: "Kerniva · 2h ago" },
] as const;

const RAIL = [
  { label: "Overview", count: "" },
  { label: "Research", count: "12" },
  { label: "Files", count: "34" },
  { label: "AI sessions", count: "8", active: true },
  { label: "Decisions", count: "5" },
] as const;

function ProductMock() {
  const typed = useTypewriter(TYPE_PHRASES);
  const active = useAutoCycle(TIMELINE.length);

  return (
    <motion.section id="product" className="section" style={{ padding: "12px 0 84px" }}>
      <div className="container">
        {/* Relative to the content box, so the chip hangs off the mock's own
            corner rather than out over the page gutter. */}
        <div style={{ position: "relative" }}>
          <motion.div
            className="mock__chip"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <div className="mock__chip-float">
              <Blueprint>
                <span className="dot-live" style={{ width: 8, height: 8 }} />
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: 14,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Handoff ready
                </span>
                <span style={{ fontSize: 12, color: muted(60) }}>nothing to reconstruct</span>
              </Blueprint>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.75, ease: EASE }}
          >
            <Blueprint className="mock">
              <div className="mock__bar">
                <img src="/kerniva-wordmark.svg" alt="" style={{ height: 14, opacity: 0.85 }} />
                <span style={{ width: 1, height: 16, background: "var(--color-divider)" }} />
                <span
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: 16,
                    letterSpacing: "0.03em",
                    textTransform: "uppercase",
                  }}
                >
                  Project · Atlas launch
                </span>
                <span className="tag tag-accent">Live</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="mock__avatar mock__avatar--tinted">MK</span>
                  <span className="mock__avatar mock__avatar--tinted">JT</span>
                  <span className="mock__avatar">+3</span>
                </div>
              </div>

              <div className="mock__body">
                <div className="mock__rail">
                  <div className="mock__label">Workspace</div>
                  {RAIL.map((item) => (
                    <span
                      key={item.label}
                      className={`mock__rail-item${"active" in item && item.active ? " is-active" : ""}`}
                    >
                      {item.label}
                      {item.count ? <span>{item.count}</span> : null}
                    </span>
                  ))}
                </div>

                <div className="mock__pane">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 600,
                        fontSize: 15,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      AI session · Pricing-page rewrite
                    </span>
                    <span className="tag tag-outline">shared with team</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                    <span className="mock__skeleton" style={{ width: "88%" }} />
                    <span className="mock__skeleton" style={{ width: "72%" }} />
                    <span className="mock__skeleton" style={{ width: "81%" }} />
                    <span className="mock__skeleton" style={{ width: "40%", marginBottom: 6 }} />
                    <div className="mock__live">
                      <span
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          color: "var(--color-accent-700)",
                        }}
                      >
                        Kerniva · live
                      </span>
                      <div
                        style={{ fontSize: 14, lineHeight: "21px", marginTop: 4, minHeight: 21 }}
                      >
                        <span>{typed}</span>
                        <span className="mock__caret" />
                      </div>
                    </div>
                  </div>

                  <div className="mock__composer">
                    <span
                      style={{
                        fontSize: 13,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: muted(45),
                      }}
                    >
                      Continue this session…
                    </span>
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        color: "var(--color-accent-700)",
                      }}
                    >
                      ↵ send
                    </span>
                  </div>
                </div>

                <div className="mock__aside">
                  <div className="mock__label">Context timeline</div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 10px" }}
                  >
                    {TIMELINE.map((entry, i) => (
                      <motion.div
                        key={entry.title}
                        className="mock__timeline-item"
                        animate={{
                          backgroundColor: i === active ? CYCLE_ACTIVE_BG : CYCLE_IDLE_BG,
                          borderColor: i === active ? CYCLE_ACTIVE_BORDER : CYCLE_IDLE_BORDER,
                        }}
                        transition={cycleTransition}
                      >
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{entry.title}</div>
                        <div style={{ fontSize: 12, color: muted(55) }}>{entry.meta}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="statusbar">
                <span className="dot-live" />
                Context: 27 sources connected · synced 4s ago
                <span style={{ marginLeft: "auto" }}>
                  Everything above stays attached to the project
                </span>
              </div>
            </Blueprint>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------- how it works --- */

const STEPS = [
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

const EVENTS = [
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

function HowItWorks({ onWatch }: { onWatch: () => void }) {
  const active = useAutoCycle(EVENTS.length);

  return (
    <motion.section id="how" className="section" style={{ paddingTop: 36 }} {...reveal}>
      <div className="container">
        <span className="eyebrow">02 · How it works</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "22ch", marginBottom: 40 }}>
          Work once. Hand it off in minutes, not meetings.
        </h2>

        <div style={{ position: "relative" }}>
          <svg
            aria-hidden="true"
            viewBox="0 0 1200 8"
            preserveAspectRatio="none"
            className="connector"
          >
            <line x1="0" y1="4" x2="1200" y2="4" stroke="var(--color-divider)" strokeWidth="1" />
            <line
              x1="0"
              y1="4"
              x2="1200"
              y2="4"
              stroke="var(--color-accent-500)"
              strokeWidth="1.5"
              strokeDasharray="10 16"
              style={{ animation: "kv-dash 2.2s linear infinite" }}
            />
          </svg>
          <div
            className="grid"
            style={{
              position: "relative",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              gap: "clamp(18px, 2.5vw, 36px)",
            }}
          >
            {STEPS.map((step) => (
              <div key={step.n} className="step">
                <span
                  className={`step-num${"solid" in step && step.solid ? " step-num--solid" : ""}`}
                >
                  {step.n}
                </span>
                <h3 className="h-sub">{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="watch-row">
          <button
            type="button"
            className="btn btn--secondary btn--lg btn--accent-hover"
            onClick={onWatch}
          >
            <PlayIcon size={16} />
            Watch it work
          </button>
          <span className="watch-row__note">See a handoff happen end to end · 45 sec</span>
        </div>

        <div
          className="grid grid--4"
          style={{
            gap: 14,
            marginTop: 48,
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
          }}
        >
          {EVENTS.map((event, i) => (
            <motion.div
              key={event.title}
              className="event-card"
              animate={{
                backgroundColor: i === active ? CYCLE_ACTIVE_BG : CYCLE_IDLE_BG,
                borderColor: i === active ? CYCLE_ACTIVE_BORDER : CYCLE_IDLE_BORDER,
              }}
              transition={cycleTransition}
            >
              <div className="event-card__head">
                Context event <span>{event.at}</span>
              </div>
              <div className="event-card__title">{event.title}</div>
              <div className="event-card__note">{event.note}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------- integrations --- */

function SlackMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
        fill="#E01E5A"
      />
      <path
        d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
        fill="#36C5F0"
      />
      <path
        d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
        fill="#2EB67D"
      />
      <path
        d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
        fill="#ECB22E"
      />
    </svg>
  );
}

const TOOLS = [
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

function ToolSet({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="marquee__set" aria-hidden={hidden || undefined}>
      {TOOLS.map((tool) => (
        <div className="tool-tile" key={tool.name}>
          {"src" in tool ? <img src={tool.src} alt="" width={30} height={30} /> : <SlackMark />}
          <span>{tool.name}</span>
        </div>
      ))}
    </div>
  );
}

/** The four registration crosses drawn inside the centre tile's frame. */
function TileCross({ style }: { style: CSSProperties }) {
  return (
    <svg
      aria-hidden="true"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      stroke="color-mix(in srgb, var(--color-text) 55%, transparent)"
      style={style}
    >
      <path d="M7.5 0v15M0 7.5h15" strokeWidth="1" />
    </svg>
  );
}

function Integrations() {
  return (
    <motion.section
      id="integrations"
      className="section--bleed"
      style={{ margin: "24px calc(50% - 50vw) 72px", padding: "72px 0 0" }}
      {...reveal}
    >
      <div className="container" style={{ textAlign: "center" }}>
        <span className="eyebrow" style={{ marginBottom: 16 }}>
          03 · Integrations
        </span>
        <h2
          className="h-section"
          style={{
            fontSize: "clamp(32px, 4vw, 54px)",
            margin: "0 auto",
            maxWidth: "22ch",
            color: "#5b0077",
          }}
        >
          Kerniva connects to the tools your team already uses
        </h2>
        <p className="lede" style={{ maxWidth: "52ch", margin: "18px auto 0" }}>
          Context moves into your existing workflow: research, files, sessions, and decisions arrive
          with the evidence your team needs to act.
        </p>
        <div className="stem" style={{ height: 56, margin: "28px auto 0" }} />
        <div className="tile-mark">
          <TileCross style={{ top: -8, left: -8 }} />
          <TileCross style={{ top: -8, right: -8 }} />
          <TileCross style={{ bottom: -8, left: -8 }} />
          <TileCross style={{ bottom: -8, right: -8 }} />
          <img src="/kerniva-tile.svg" alt="Kerniva" />
        </div>
        <div className="stem" style={{ height: 40 }} />
      </div>
      <div className="marquee">
        <ToolSet />
        <ToolSet hidden />
      </div>
    </motion.section>
  );
}

/* ---------------------------------------------------------- research --- */

const RESEARCH_STEPS = [
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

const INTEGRITY = [
  "Citation-preserving drafts with inline provenance",
  "Graphify-powered concept graph across the whole library",
  "Supervisor and committee roles with approval rights",
  "Exportable audit trail for ethics and integrity offices",
] as const;

const ARTIFACTS = [
  "Structured literature review with coverage matrix",
  "Research proposal and methodology section",
  "Chapter drafts with tracked claims",
  "Conference deck and poster outline",
  "Reviewer response letters",
] as const;

function Research() {
  return (
    <motion.section id="research" className="section" {...reveal}>
      <div className="container">
        <span className="eyebrow">04 · Research and thesis</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "24ch" }}>
          Long-form research with a shared brain and real review gates
        </h2>
        <p className="lede" style={{ marginTop: 18 }}>
          For labs, supervisors, and graduate students: a project library that grows into a
          knowledge graph, AI that cites what it reads, and supervisor approval built into the
          workflow.
        </p>

        <div className="grid grid--3" style={{ gap: "clamp(18px, 2.5vw, 36px)", marginTop: 40 }}>
          {RESEARCH_STEPS.map((step) => (
            <div key={step.n} className="step">
              <span
                className={`step-num${"solid" in step && step.solid ? " step-num--solid" : ""}`}
              >
                {step.n}
              </span>
              <h3 className="h-sub">{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>

        <div className="split" style={{ marginTop: 56 }}>
          <div>
            <h3
              className="h-section"
              style={{ fontSize: "clamp(24px, 2.4vw, 32px)", lineHeight: 1.1 }}
            >
              Integrity by construction
            </h3>
            <p className="lede" style={{ maxWidth: "52ch", marginTop: 14 }}>
              Institutions are asking how AI was used. Kerniva answers that question with the event
              log: which sources were in context, which skill produced the draft, which model was
              used, and who approved it.
            </p>
            <div className="rows" style={{ marginTop: 22 }}>
              {INTEGRITY.map((line) => (
                <div className="row-item" key={line}>
                  <CheckIcon size={14} style={{ color: "var(--color-accent-700)" }} />
                  {line}
                </div>
              ))}
            </div>
          </div>

          <Blueprint style={{ background: "var(--color-bg)" }}>
            <div className="plate__bar">
              <span>Artifacts researchers generate</span>
              <span>KV-R1</span>
            </div>
            <div>
              {ARTIFACTS.map((line, i) => (
                <div
                  className="row-item"
                  key={line}
                  style={{
                    padding: "12px 18px",
                    borderBottom: i === ARTIFACTS.length - 1 ? 0 : "1px solid var(--color-divider)",
                  }}
                >
                  <span className="row-item__num">{`0${i + 1}`}</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </Blueprint>
        </div>
      </div>
    </motion.section>
  );
}

/* ---------------------------------------------------------- security --- */

const SECURITY = [
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

function Security() {
  return (
    <motion.section id="security" className="section" {...reveal}>
      <div className="container">
        <span className="eyebrow">05 · Security</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "24ch" }}>
          Security is the product, not a page
        </h2>
        <p className="lede" style={{ marginTop: 18 }}>
          Kerniva is designed so that the safe path is the only path: secrets never reach clients,
          agents never write canonical state, and the model only sees what the person asking is
          allowed to see.
        </p>

        <div className="grid grid--3" style={{ gap: "clamp(22px, 3vw, 36px)", marginTop: 44 }}>
          {SECURITY.map(({ Icon, title, body }) => (
            <Blueprint key={title} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon size={18} style={{ color: "var(--color-accent-700)", flex: "none" }} />
                <h3>{title}</h3>
              </div>
              <p>{body}</p>
            </Blueprint>
          ))}
        </div>

        <Blueprint
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px 24px",
            padding: "18px 22px",
            marginTop: 44,
            background: "var(--color-bg)",
          }}
        >
          <span
            style={{
              fontSize: 13,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "var(--color-accent-700)",
              whiteSpace: "nowrap",
            }}
          >
            Compliance · Evidence on request
          </span>
          <span
            style={{
              fontSize: 14.5,
              lineHeight: "22px",
              color: muted(78),
              flex: 1,
              minWidth: "32ch",
            }}
          >
            SOC 2 program in progress. We complete SIG and CAIQ questionnaires and provide
            architecture walkthroughs for enterprise security reviews.
          </span>
          <a
            href="mailto:security@kerniva.app"
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            security@kerniva.app
          </a>
        </Blueprint>
      </div>
    </motion.section>
  );
}

/* ----------------------------------------------------------- company --- */

const PRINCIPLES = [
  "Humans decide; agents propose",
  "The event log is the truth",
  "The safe path is the only path",
] as const;

function Company() {
  return (
    <motion.section id="company" className="section" {...reveal}>
      <div className="container">
        <span className="eyebrow">06 · Company</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "24ch" }}>
          We build AI tools for the work that cannot leak
        </h2>
        <p className="lede" style={{ marginTop: 18 }}>
          Kerniva started from a simple observation: the teams with the most to gain from AI are the
          ones least able to use consumer tools. We are building the workspace they can actually
          adopt.
        </p>

        <div className="split" style={{ marginTop: 44, gap: "clamp(24px, 4vw, 64px)" }}>
          <div>
            <h3 className="h-sub" style={{ fontSize: 20, marginBottom: 12 }}>
              Principles
            </h3>
            <div className="rows">
              {PRINCIPLES.map((line, i) => (
                <div className="row-item" key={line} style={{ padding: "13px 0" }}>
                  <span className="row-item__num">{`0${i + 1}`}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="h-sub" style={{ fontSize: 20, marginBottom: 12 }}>
              Where we are
            </h3>
            <p
              className="lede"
              style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 13 }}
            >
              Kerniva is in private beta with design partners in enterprise strategy, advisory, and
              academic research. Production deployments run on AWS with manual release gates.
            </p>
          </div>
          <div>
            <h3 className="h-sub" style={{ fontSize: 20, marginBottom: 12 }}>
              Work with us
            </h3>
            <p
              className="lede"
              style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 13 }}
            >
              We are hiring engineers who care about governance, security, and the craft of dense,
              quiet interfaces.
            </p>
            <a
              href="mailto:hello@kerniva.app"
              style={{
                display: "inline-block",
                marginTop: 14,
                fontFamily: "var(--font-heading)",
                fontWeight: 600,
                fontSize: 15,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              hello@kerniva.app
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* --------------------------------------------------------------- faq --- */

const FAQ = [
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

function Faq() {
  return (
    <motion.section id="faq" className="section faq" {...reveal}>
      <div className="container">
        <span className="eyebrow">07 · Questions</span>
        <hr className="rule" style={{ marginBottom: 0 }} />
        {FAQ.map((item) => (
          <Disclosure key={item.q} question={item.q}>
            <p>{item.a}</p>
          </Disclosure>
        ))}
      </div>
    </motion.section>
  );
}

/* --------------------------------------------------------- next step --- */

function NextStep() {
  return (
    <motion.section className="section" style={{ padding: "48px 0 88px" }} {...reveal}>
      <div className="container">
        <span className="eyebrow">08 · The next step</span>
        <hr className="rule" style={{ marginBottom: 32 }} />
        <h2
          className="h-section"
          style={{ fontSize: "clamp(34px, 4.4vw, 60px)", lineHeight: 1.05, maxWidth: "20ch" }}
        >
          See Kerniva on your team’s own work
        </h2>
        <p className="lede" style={{ maxWidth: "54ch", marginTop: 20 }}>
          A 30-minute walkthrough on a real project, or a place in the queue for a workspace of your
          own.
        </p>
        <div className="hero__actions">
          <Link to="/demo" className="btn btn--primary btn--lg blueprint">
            <Corners />
            Book a demo
          </Link>
          <Link to="/waitlist" className="btn btn--secondary btn--lg">
            Join the waitlist
          </Link>
        </div>
      </div>
    </motion.section>
  );
}

/* -------------------------------------------------------------- page --- */

export function HomePage() {
  const [filmOpen, setFilmOpen] = useState(false);

  useEffect(() => {
    document.title = "Kerniva: AI workspace for teams with no time to lose";
  }, []);

  const openFilm = () => setFilmOpen(true);

  return (
    <>
      <Hero />
      <ProductMock />
      <Backers />
      <HowItWorks onWatch={openFilm} />
      <Integrations />
      <Research />
      <Security />
      <Company />
      <Faq />
      <NextStep />
      <VideoModal open={filmOpen} onClose={() => setFilmOpen(false)} />
    </>
  );
}
