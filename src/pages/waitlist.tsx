import { PageHeader } from "../components/page-header";
import { WaitlistForm } from "../components/waitlist-form";
import { EMAIL_CONTACT, WAITLIST_PAGE } from "../content";

export function WaitlistPage() {
  return (
    <>
      <PageHeader
        eyebrow={WAITLIST_PAGE.eyebrow}
        title={WAITLIST_PAGE.title}
        lede={WAITLIST_PAGE.lede}
      />
      <section className="section">
        <div className="container split" style={{ alignItems: "start" }}>
          <WaitlistForm />
          <div>
            <div className="rule" />
            <h2 className="h-section" style={{ fontSize: 26, marginBottom: 12 }}>
              {WAITLIST_PAGE.getTitle}
            </h2>
            <ul className="feature-list">
              {WAITLIST_PAGE.getPoints.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p style={{ marginTop: 20, color: "var(--muted)" }}>
              {WAITLIST_PAGE.impatient} <a href={`mailto:${EMAIL_CONTACT}`}>{EMAIL_CONTACT}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
