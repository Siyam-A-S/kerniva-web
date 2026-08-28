import { Link } from "react-router-dom";
import { Corners } from "./blueprint";

export function Cta({
  title = "Kerniva is best experienced with real work",
  body = "See how Kerniva fits your team’s material and workflow through a tailored session, or explore a live workspace when early access opens.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="section section--tight">
      <div className="container">
        <div className="cta">
          <div>
            <h2 className="h-section">{title}</h2>
            <p>{body}</p>
          </div>
          <div className="hero__actions">
            <Link to="/waitlist" className="btn btn--secondary btn--lg">
              Join the waitlist
            </Link>
            <Link to="/demo" className="btn btn--primary btn--lg blueprint">
              <Corners />
              Book a demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
