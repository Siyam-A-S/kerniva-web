import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";

const controls = [
  [
    "Identity",
    "AWS Cognito with SSO (SAML / OIDC), enforced MFA, and short-lived tokens. Refresh tokens never reach the browser.",
  ],
  [
    "Authorization",
    "RBAC plus attribute-based policies evaluated server-side; tenant isolation enforced by forced PostgreSQL row-level security.",
  ],
  [
    "Data in transit & at rest",
    "TLS 1.3 everywhere; S3, RDS, and queues encrypted with customer-managed KMS keys.",
  ],
  [
    "AI data handling",
    "Single-egress AI gateway with zero-retention agreements. Prompts, sources, and model responses are excluded from logs and telemetry.",
  ],
  [
    "Sensitivity tiers",
    "General, restricted, and privileged tiers on every asset; audience views materialized per role with silent redaction.",
  ],
  ["Audit", "Append-only, tamper-evident event log with hash chaining and SIEM export."],
  [
    "Application security",
    "OWASP Top 10 program, strict CSP and secure headers, secrets in AWS Secrets Manager, dependency and container scanning in CI.",
  ],
  [
    "Residency & isolation",
    "Deploy in your AWS region or your own account. Nonproduction and production live in independent accounts with separate state.",
  ],
];

export function SecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Security"
        title="Security is the product, not a page."
        lede="Kerniva is designed so that the safe path is the only path: secrets never reach clients, agents never write canonical state, and the model only sees what the person asking is allowed to see."
      />
      <section className="section">
        <div className="container grid grid--2">
          {controls.map(([t, b]) => (
            <div className="card" key={t}>
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section section--subtle">
        <div className="container">
          <span className="eyebrow">Compliance</span>
          <h2 style={{ fontSize: 30, marginBottom: 16 }}>Evidence on request</h2>
          <p className="lede" style={{ marginBottom: 24 }}>
            SOC 2 program in progress. We complete SIG and CAIQ questionnaires and provide
            architecture walkthroughs for enterprise security reviews.
          </p>
          <a className="btn btn--secondary" href="mailto:security@kerniva.app">
            security@kerniva.app
          </a>
        </div>
      </section>
      <Cta
        title="Request the security package"
        body="Architecture overview, data-flow diagrams, and questionnaire responses for your review."
      />
    </>
  );
}
