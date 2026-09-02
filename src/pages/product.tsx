import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";
import { PRODUCT_PAGE, PRODUCT_STEPS, PRODUCT_SURFACES } from "../content";

export function ProductPage() {
  return (
    <>
      <PageHeader
        eyebrow={PRODUCT_PAGE.eyebrow}
        title={PRODUCT_PAGE.title}
        lede={PRODUCT_PAGE.lede}
      />
      <section className="section">
        <div className="container">
          <div className="grid grid--3">
            {PRODUCT_SURFACES.map((s) => (
              <div className="card" key={s.name}>
                <span className="eyebrow">{s.tag}</span>
                <h3>{s.name}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--subtle">
        <div className="container">
          <span className="eyebrow">{PRODUCT_PAGE.protocolEyebrow}</span>
          <h2 className="h-section" style={{ fontSize: 32, marginBottom: 36, maxWidth: "26ch" }}>
            {PRODUCT_PAGE.protocolTitle}
          </h2>
          <div className="grid grid--4">
            {PRODUCT_STEPS.map(([t, b], i) => (
              <div className="card" key={t}>
                <div className="card__icon">{i + 1}</div>
                <h3>{t}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <div>
            <div className="rule" />
            <h2 className="h-section">{PRODUCT_PAGE.skillsTitle}</h2>
            <p>{PRODUCT_PAGE.skillsBody}</p>
            <ul className="feature-list">
              {PRODUCT_PAGE.skillsPoints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>{PRODUCT_PAGE.deploymentTitle}</h3>
            <p style={{ marginBottom: 16 }}>{PRODUCT_PAGE.deploymentBody}</p>
            <ul className="feature-list">
              {PRODUCT_PAGE.deploymentPoints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
