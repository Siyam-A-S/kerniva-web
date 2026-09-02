import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";
import { SOLUTIONS, SOLUTIONS_PAGE } from "../content";

export function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow={SOLUTIONS_PAGE.eyebrow}
        title={SOLUTIONS_PAGE.title}
        lede={SOLUTIONS_PAGE.lede}
      />
      {SOLUTIONS.map((s, i) => (
        <section className={`section${i % 2 ? " section--subtle" : ""}`} id={s.id} key={s.id}>
          <div className="container split">
            <div>
              <div className="rule" />
              <h2 className="h-section">{s.title}</h2>
              <p>{s.lede}</p>
            </div>
            <ul className="feature-list">
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <Cta />
    </>
  );
}
