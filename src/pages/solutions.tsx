import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";

const solutions = [
  {
    id: "enterprise",
    title: "Enterprise knowledge teams",
    lede: "Strategy, product, and operations groups working across confidential material.",
    points: [
      "Project-scoped libraries so context never leaks between initiatives",
      "Real-time co-working with a single accountable driver",
      "Board-ready briefs and decks generated with provenance",
      "Connectors for SharePoint with ACL-suggested sensitivity",
    ],
  },
  {
    id: "legal",
    title: "Legal, audit, and compliance",
    lede: "Practices that must show exactly what the model saw and who approved the output.",
    points: [
      "Privileged tier enforced at retrieval — not by prompt instruction",
      "Tamper-evident audit trail with SIEM export",
      "Consent-to-redaction on every handoff between colleagues",
      "Security questionnaire (SIG / CAIQ) and SOC 2 evidence on request",
    ],
  },
  {
    id: "consulting",
    title: "Consulting and advisory",
    lede: "Engagement teams that produce a lot of artifacts under tight client confidentiality.",
    points: [
      "One project per engagement with its own policy envelope",
      "Proposal inbox so juniors can draft while partners decide",
      "Reusable skills for your house style of memo, model, and deck",
      "Explainability on every deliverable for client review",
    ],
  },
];

export function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title="Built for teams where a leak is a headline."
        lede="Kerniva is deployed by organizations that need the productivity of AI with the control of a records system."
      />
      {solutions.map((s, i) => (
        <section className={`section${i % 2 ? " section--subtle" : ""}`} id={s.id} key={s.id}>
          <div className="container split">
            <div>
              <div className="rule" />
              <h2>{s.title}</h2>
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
