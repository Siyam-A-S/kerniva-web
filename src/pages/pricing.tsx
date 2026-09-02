import { Link } from "react-router-dom";
import { PageHeader } from "../components/page-header";
import { Cta } from "../components/cta";
import { BTN_TALK_TO_SALES, PRICING_PAGE, PRICING_PLANS } from "../content";

export function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow={PRICING_PAGE.eyebrow}
        title={PRICING_PAGE.title}
        lede={PRICING_PAGE.lede}
      />
      <section className="section">
        <div className="container grid grid--3">
          {PRICING_PLANS.map((p) => (
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
                {BTN_TALK_TO_SALES}
              </Link>
            </div>
          ))}
        </div>
      </section>
      <Cta />
    </>
  );
}
