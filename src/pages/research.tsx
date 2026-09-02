import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";
import {
  ARTIFACTS,
  CTA_RESEARCH,
  INTEGRITY,
  RESEARCH_ARTIFACTS_TITLE,
  RESEARCH_INTEGRITY_LEDE,
  RESEARCH_LEDE,
  RESEARCH_PAGE,
  RESEARCH_STEPS,
} from "../content";

export function ResearchPage() {
  return (
    <>
      <PageHeader
        eyebrow={RESEARCH_PAGE.eyebrow}
        title={RESEARCH_PAGE.title}
        lede={RESEARCH_LEDE}
      />
      <section className="section">
        <div className="container grid grid--3">
          {RESEARCH_STEPS.map((step) => (
            <div className="card" key={step.n}>
              <div className="card__icon">{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section section--subtle">
        <div className="container split">
          <div>
            <div className="rule" />
            <h2 className="h-section">{RESEARCH_PAGE.integrityTitle}</h2>
            <p>{RESEARCH_INTEGRITY_LEDE}</p>
            <ul className="feature-list">
              {INTEGRITY.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>{RESEARCH_ARTIFACTS_TITLE}</h3>
            <ul className="feature-list" style={{ marginTop: 12 }}>
              {ARTIFACTS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Cta title={CTA_RESEARCH.title} body={CTA_RESEARCH.body} />
    </>
  );
}
