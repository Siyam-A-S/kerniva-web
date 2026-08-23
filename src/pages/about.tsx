import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";

export function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Company"
        title="We build AI tools for the work that cannot leak."
        lede="Kerniva started from a simple observation: the teams with the most to gain from AI are the ones least able to use consumer tools. We are building the workspace they can actually adopt."
      />
      <section className="section">
        <div className="container grid grid--3">
          <div className="card">
            <h3>Principles</h3>
            <ul className="feature-list" style={{ marginTop: 8 }}>
              <li>Humans decide; agents propose</li>
              <li>The event log is the truth</li>
              <li>The safe path is the only path</li>
            </ul>
          </div>
          <div className="card">
            <h3>Where we are</h3>
            <p>
              Kerniva is in private beta with design partners in enterprise strategy, advisory, and
              academic research. Production deployments run on AWS with manual release gates.
            </p>
          </div>
          <div className="card">
            <h3>Work with us</h3>
            <p>
              We are hiring engineers who care about governance, security, and the craft of dense,
              quiet interfaces. Write to <a href="mailto:hello@kerniva.app">hello@kerniva.app</a>.
            </p>
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
