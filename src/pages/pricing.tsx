import { Link } from "react-router-dom";
import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";

const plans = [
  {
    name: "Team",
    price: "Contact us",
    period: "",
    blurb: "For a single group running governed projects on Kerniva-hosted AWS.",
    items: [
      "Up to 25 seats",
      "Unlimited projects",
      "Relay, Library, Artifacts",
      "SSO & MFA",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    blurb: "For organizations with security review, data residency, and connector needs.",
    items: [
      "Unlimited seats",
      "Deploy in your AWS account or region",
      "SharePoint and custom connectors",
      "Audit export to your SIEM",
      "Security questionnaire & architecture review",
      "Dedicated success engineer",
    ],
    featured: true,
  },
  {
    name: "Research",
    price: "Institutional",
    period: "",
    blurb: "For departments, labs, and graduate schools.",
    items: [
      "Department-wide seats",
      "Supervisor & committee roles",
      "Integrity audit export",
      "Library connectors for repositories",
      "Onboarding for faculty",
    ],
    featured: false,
  },
];

export function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Priced for teams, not tokens."
        lede="Kerniva is sold per seat with model usage included within fair-use envelopes you control per project."
      />
      <section className="section">
        <div className="container grid grid--3">
          {plans.map((p) => (
            <div className={`card plan${p.featured ? " plan--featured" : ""}`} key={p.name}>
              <div>
                <span className="eyebrow">{p.name}</span>
                <div className="plan__price">
                  {p.price} <small>{p.period}</small>
                </div>
              </div>
              <p>{p.blurb}</p>
              <ul className="feature-list">
                {p.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`btn ${p.featured ? "btn--primary" : "btn--secondary"}`}
              >
                Talk to sales
              </Link>
            </div>
          ))}
        </div>
      </section>
      <Cta />
    </>
  );
}
