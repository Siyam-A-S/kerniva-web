import { Link } from "react-router-dom";
import { PageHeader } from "../components/page-header";
import {
  LIVE_PRIVACY_URL,
  LIVE_TERMS_URL,
  PRIVACY_CONTACT,
  PRIVACY_DEMO_POINTS,
  PRIVACY_PAGE,
  PRIVACY_SITE_POINTS,
} from "../content";

function Points({ points }: { points: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div className="grid grid--2">
      {points.map(([t, b]) => (
        <div className="card" key={t}>
          <h3>{t}</h3>
          <p>{b}</p>
        </div>
      ))}
    </div>
  );
}

/**
 * Two subjects, kept apart on purpose. The first half is this site's own
 * behaviour. The second summarises the live demo's Privacy Notice, which is
 * published by the product on its own origin and is the binding text; this
 * page links to it rather than restating it in full.
 */
export function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow={PRIVACY_PAGE.eyebrow}
        title={PRIVACY_PAGE.title}
        lede={PRIVACY_PAGE.lede}
      />
      <section className="section">
        <div className="container">
          <span className="eyebrow">{PRIVACY_PAGE.siteEyebrow}</span>
          <div className="rule" />
          <h2 className="h-section" style={{ marginBottom: 24 }}>
            {PRIVACY_PAGE.siteTitle}
          </h2>
          <Points points={PRIVACY_SITE_POINTS} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <span className="eyebrow">{PRIVACY_PAGE.demoEyebrow}</span>
          <div className="rule" />
          <h2 className="h-section" style={{ marginBottom: 12 }}>
            {PRIVACY_PAGE.demoTitle}
          </h2>
          <p className="lede" style={{ marginBottom: 24 }}>
            {PRIVACY_PAGE.demoIntro}
          </p>
          <Points points={PRIVACY_DEMO_POINTS} />
          {/* The product is another origin: plain anchors, not router links. */}
          <div className="hero__actions" style={{ marginTop: 28 }}>
            <a href={LIVE_PRIVACY_URL} className="btn btn--secondary">
              {PRIVACY_PAGE.noticeLink}
            </a>
            <a href={LIVE_TERMS_URL} className="btn btn--ghost">
              {PRIVACY_PAGE.termsLink}
            </a>
          </div>
        </div>
      </section>
      <section className="section section--tight">
        <div className="container">
          <h2 className="h-section" style={{ fontSize: 26, marginBottom: 12 }}>
            {PRIVACY_CONTACT.title}
          </h2>
          <p className="lede">
            {PRIVACY_CONTACT.before}{" "}
            <a href={`mailto:${PRIVACY_CONTACT.email}`}>{PRIVACY_CONTACT.email}</a>{" "}
            {PRIVACY_CONTACT.after}
          </p>
          <p className="lede" style={{ marginTop: 16 }}>
            {PRIVACY_PAGE.enterpriseNote} <Link to="/security">{PRIVACY_PAGE.enterpriseLink}</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
