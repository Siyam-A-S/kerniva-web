import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";
import {
  ABOUT_PAGE,
  COMPANY_HIRING,
  COMPANY_LEDE,
  COMPANY_WHERE,
  EMAIL_CONTACT,
  PRINCIPLES,
} from "../content";

export function AboutPage() {
  return (
    <>
      <PageHeader eyebrow={ABOUT_PAGE.eyebrow} title={ABOUT_PAGE.title} lede={COMPANY_LEDE} />
      <section className="section">
        <div className="container grid grid--3">
          <div className="card">
            <h3>{ABOUT_PAGE.principlesTitle}</h3>
            <ul className="feature-list" style={{ marginTop: 8 }}>
              {PRINCIPLES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3>{ABOUT_PAGE.whereTitle}</h3>
            <p>{COMPANY_WHERE}</p>
          </div>
          <div className="card">
            <h3>{ABOUT_PAGE.hiringTitle}</h3>
            <p>
              {COMPANY_HIRING} {ABOUT_PAGE.hiringWriteTo}{" "}
              <a href={`mailto:${EMAIL_CONTACT}`}>{EMAIL_CONTACT}</a>.
            </p>
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
