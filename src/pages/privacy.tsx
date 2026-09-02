import { Link } from "react-router-dom";
import { PageHeader } from "../components/page-header";
import { PRIVACY_PAGE, PRIVACY_POINTS } from "../content";

export function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow={PRIVACY_PAGE.eyebrow}
        title={PRIVACY_PAGE.title}
        lede={PRIVACY_PAGE.lede}
      />
      <section className="section">
        <div className="container grid grid--2">
          {PRIVACY_POINTS.map(([t, b]) => (
            <div className="card" key={t}>
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section section--tight">
        <div className="container">
          <p className="lede">
            {PRIVACY_PAGE.enterpriseNote} <Link to="/security">{PRIVACY_PAGE.enterpriseLink}</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
