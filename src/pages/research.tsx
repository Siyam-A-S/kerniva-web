import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";

export function ResearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Research & thesis"
        title="Long-form research with a shared brain and real review gates."
        lede="For labs, supervisors, and graduate students: a project library that grows into a knowledge graph, AI that cites what it reads, and supervisor approval built into the workflow."
      />
      <section className="section">
        <div className="container grid grid--3">
          <div className="card">
            <div className="card__icon">01</div>
            <h3>Build the library</h3>
            <p>
              Drop in papers, datasets, notes, and prior drafts. Each source is extracted, embedded,
              and graphed so relationships between concepts, authors, and claims become navigable.
            </p>
          </div>
          <div className="card">
            <div className="card__icon">02</div>
            <h3>Work the thesis</h3>
            <p>
              Run literature reviews, gap analyses, and argument maps in a Relay session with your
              supervisor. Every claim in a draft links back to the passage it came from.
            </p>
          </div>
          <div className="card">
            <div className="card__icon">03</div>
            <h3>Generate and defend</h3>
            <p>
              Produce chapters, abstracts, slide decks, and reviewer responses as governed
              artifacts. Supervisors approve; the record shows what was AI-assisted and what was
              not.
            </p>
          </div>
        </div>
      </section>
      <section className="section section--subtle">
        <div className="container split">
          <div>
            <div className="rule" />
            <h2>Integrity by construction.</h2>
            <p>
              Institutions are asking how AI was used. Kerniva answers that question with the event
              log: which sources were in context, which skill produced the draft, which model was
              used, and who approved it.
            </p>
            <ul className="feature-list">
              <li>Citation-preserving drafts with inline provenance</li>
              <li>Graphify-powered concept graph across the whole library</li>
              <li>Supervisor and committee roles with approval rights</li>
              <li>Exportable audit trail for ethics and integrity offices</li>
            </ul>
          </div>
          <div className="card">
            <h3>Artifacts researchers generate</h3>
            <ul className="feature-list" style={{ marginTop: 12 }}>
              <li>Structured literature review with coverage matrix</li>
              <li>Research proposal and methodology section</li>
              <li>Chapter drafts with tracked claims</li>
              <li>Conference deck and poster outline</li>
              <li>Reviewer response letters</li>
            </ul>
          </div>
        </div>
      </section>
      <Cta
        title="Bring Kerniva to your department"
        body="We work with research offices and graduate schools on institutional deployments with SSO and data residency."
      />
    </>
  );
}
