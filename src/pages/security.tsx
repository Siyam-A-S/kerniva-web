import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";
import {
  CTA_SECURITY,
  EMAIL_SECURITY,
  SECURITY_COMPLIANCE_BODY,
  SECURITY_CONTROLS,
  SECURITY_LEDE,
  SECURITY_PAGE,
} from "../content";

export function SecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow={SECURITY_PAGE.eyebrow}
        title={SECURITY_PAGE.title}
        lede={SECURITY_LEDE}
      />
      <section className="section">
        <div className="container grid grid--2">
          {SECURITY_CONTROLS.map(([t, b]) => (
            <div className="card" key={t}>
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section section--subtle">
        <div className="container">
          <span className="eyebrow">{SECURITY_PAGE.complianceEyebrow}</span>
          <h2 className="h-section" style={{ fontSize: 30, marginBottom: 16 }}>
            {SECURITY_PAGE.complianceTitle}
          </h2>
          <p className="lede" style={{ marginBottom: 24 }}>
            {SECURITY_COMPLIANCE_BODY}
          </p>
          <a className="btn btn--secondary" href={`mailto:${EMAIL_SECURITY}`}>
            {EMAIL_SECURITY}
          </a>
        </div>
      </section>
      <Cta title={CTA_SECURITY.title} body={CTA_SECURITY.body} />
    </>
  );
}
