import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Backers } from "../components/backers";
import { Blueprint, Corners } from "../components/blueprint";
import { Disclosure } from "../components/disclosure";
import { SectionLink } from "../components/section-link";
import { VideoModal } from "../components/video-modal";
import { ArrowRightIcon, CheckIcon, PlayIcon } from "../components/icons";
import { useAutoCycle, useTypewriter } from "../components/anim";
import {
  ARTIFACTS,
  BTN_BOOK_DEMO,
  BTN_JOIN_WAITLIST,
  COMPANY_HIRING,
  COMPANY_LEDE,
  COMPANY_WHERE,
  EMAIL_HELLO,
  EMAIL_SECURITY,
  FAQ,
  HOME_COMPANY,
  HOME_EVENTS as EVENTS,
  HOME_FAQ_EYEBROW,
  HOME_HERO,
  HOME_HOW,
  HOME_INTEGRATIONS,
  HOME_MOCK,
  HOME_NEXT_STEP,
  HOME_RAIL as RAIL,
  HOME_RESEARCH,
  HOME_SECURITY,
  HOME_SECURITY_CARDS as SECURITY,
  HOME_STEPS as STEPS,
  HOME_TIMELINE as TIMELINE,
  HOME_TYPE_PHRASES as TYPE_PHRASES,
  INTEGRITY,
  PRINCIPLES,
  RESEARCH_ARTIFACTS_TITLE,
  RESEARCH_INTEGRITY_LEDE,
  RESEARCH_LEDE,
  RESEARCH_STEPS,
  SECURITY_COMPLIANCE_BODY,
  SECURITY_LEDE,
  TITLE_HOME,
  TOOLS,
} from "../content";
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
              {HOME_HERO.line1}
            </motion.span>
            <motion.span
              style={{ display: "block", color: "var(--color-accent-700)" }}
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={riseIn(0.29, 0.85)}
            >
              {HOME_HERO.line2}
            </motion.span>
          </h1>
          <motion.p
            className="lede"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={riseIn(0.5)}
          >
            {HOME_HERO.lede}
          </motion.p>
          <motion.div
            className="hero__actions"
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={riseIn(0.66)}
          >
            <Link to="/demo" className="btn btn--primary btn--lg blueprint">
              <Corners />
              {HOME_HERO.primary}
            </Link>
            {/* A real anchor, so the smooth scroll comes from `scroll-behavior`
                in styles.css, which the reduced-motion block already turns off. */}
            <SectionLink hash="how" className="btn btn--secondary btn--lg">
              {HOME_HERO.secondary}
              <ArrowRightIcon size={14} />
            </SectionLink>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------- product mock --- */

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
                  {HOME_MOCK.chipTitle}
                </span>
                <span style={{ fontSize: 12, color: muted(60) }}>{HOME_MOCK.chipNote}</span>
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
                  {HOME_MOCK.project}
                </span>
                <span className="tag tag-accent">{HOME_MOCK.liveTag}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  <span className="mock__avatar mock__avatar--tinted">{HOME_MOCK.avatars[0]}</span>
                  <span className="mock__avatar mock__avatar--tinted">{HOME_MOCK.avatars[1]}</span>
                  <span className="mock__avatar">{HOME_MOCK.avatars[2]}</span>
                </div>
              </div>

              <div className="mock__body">
                <div className="mock__rail">
                  <div className="mock__label">{HOME_MOCK.railLabel}</div>
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
                      {HOME_MOCK.sessionTitle}
                    </span>
                    <span className="tag tag-outline">{HOME_MOCK.sharedTag}</span>
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
                        {HOME_MOCK.liveLabel}
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
                      {HOME_MOCK.composer}
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
                      {HOME_MOCK.send}
                    </span>
                  </div>
                </div>

                <div className="mock__aside">
                  <div className="mock__label">{HOME_MOCK.timelineLabel}</div>
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
                {HOME_MOCK.status}
                <span style={{ marginLeft: "auto" }}>{HOME_MOCK.statusEnd}</span>
              </div>
            </Blueprint>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------- how it works --- */

function HowItWorks({ onWatch }: { onWatch: () => void }) {
  const active = useAutoCycle(EVENTS.length);

  return (
    <motion.section id="how" className="section" style={{ paddingTop: 36 }} {...reveal}>
      <div className="container">
        <span className="eyebrow">{HOME_HOW.eyebrow}</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "22ch", marginBottom: 40 }}>
          {HOME_HOW.title}
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
            {HOME_HOW.watch}
          </button>
          <span className="watch-row__note">{HOME_HOW.watchNote}</span>
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
                {HOME_HOW.eventLabel} <span>{event.at}</span>
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
          {HOME_INTEGRATIONS.eyebrow}
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
          {HOME_INTEGRATIONS.title}
        </h2>
        <p className="lede" style={{ maxWidth: "52ch", margin: "18px auto 0" }}>
          {HOME_INTEGRATIONS.lede}
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

function Research() {
  return (
    <motion.section id="research" className="section" {...reveal}>
      <div className="container">
        <span className="eyebrow">{HOME_RESEARCH.eyebrow}</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "24ch" }}>
          {HOME_RESEARCH.title}
        </h2>
        <p className="lede" style={{ marginTop: 18 }}>
          {RESEARCH_LEDE}
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
              {HOME_RESEARCH.integrityTitle}
            </h3>
            <p className="lede" style={{ maxWidth: "52ch", marginTop: 14 }}>
              {RESEARCH_INTEGRITY_LEDE}
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
              <span>{RESEARCH_ARTIFACTS_TITLE}</span>
              <span>{HOME_RESEARCH.plateRef}</span>
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

function Security() {
  return (
    <motion.section id="security" className="section" {...reveal}>
      <div className="container">
        <span className="eyebrow">{HOME_SECURITY.eyebrow}</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "24ch" }}>
          {HOME_SECURITY.title}
        </h2>
        <p className="lede" style={{ marginTop: 18 }}>
          {SECURITY_LEDE}
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
            {HOME_SECURITY.complianceLabel}
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
            {SECURITY_COMPLIANCE_BODY}
          </span>
          <a
            href={`mailto:${EMAIL_SECURITY}`}
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 600,
              fontSize: 15,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {EMAIL_SECURITY}
          </a>
        </Blueprint>
      </div>
    </motion.section>
  );
}

/* ----------------------------------------------------------- company --- */

function Company() {
  return (
    <motion.section id="company" className="section" {...reveal}>
      <div className="container">
        <span className="eyebrow">{HOME_COMPANY.eyebrow}</span>
        <hr className="rule" />
        <h2 className="h-section" style={{ maxWidth: "24ch" }}>
          {HOME_COMPANY.title}
        </h2>
        <p className="lede" style={{ marginTop: 18 }}>
          {COMPANY_LEDE}
        </p>

        <div className="split" style={{ marginTop: 44, gap: "clamp(24px, 4vw, 64px)" }}>
          <div>
            <h3 className="h-sub" style={{ fontSize: 20, marginBottom: 12 }}>
              {HOME_COMPANY.principlesTitle}
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
              {HOME_COMPANY.whereTitle}
            </h3>
            <p
              className="lede"
              style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 13 }}
            >
              {COMPANY_WHERE}
            </p>
          </div>
          <div>
            <h3 className="h-sub" style={{ fontSize: 20, marginBottom: 12 }}>
              {HOME_COMPANY.hiringTitle}
            </h3>
            <p
              className="lede"
              style={{ borderTop: "1px solid var(--color-divider)", paddingTop: 13 }}
            >
              {COMPANY_HIRING}
            </p>
            <a
              href={`mailto:${EMAIL_HELLO}`}
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
              {EMAIL_HELLO}
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* --------------------------------------------------------------- faq --- */

function Faq() {
  return (
    <motion.section id="faq" className="section faq" {...reveal}>
      <div className="container">
        <span className="eyebrow">{HOME_FAQ_EYEBROW}</span>
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
        <span className="eyebrow">{HOME_NEXT_STEP.eyebrow}</span>
        <hr className="rule" style={{ marginBottom: 32 }} />
        <h2
          className="h-section"
          style={{ fontSize: "clamp(34px, 4.4vw, 60px)", lineHeight: 1.05, maxWidth: "20ch" }}
        >
          {HOME_NEXT_STEP.title}
        </h2>
        <p className="lede" style={{ maxWidth: "54ch", marginTop: 20 }}>
          {HOME_NEXT_STEP.lede}
        </p>
        <div className="hero__actions">
          <Link to="/demo" className="btn btn--primary btn--lg blueprint">
            <Corners />
            {BTN_BOOK_DEMO}
          </Link>
          <Link to="/waitlist" className="btn btn--secondary btn--lg">
            {BTN_JOIN_WAITLIST}
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
    document.title = TITLE_HOME;
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
