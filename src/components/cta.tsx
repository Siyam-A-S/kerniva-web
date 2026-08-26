import { Link } from "react-router-dom";

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
            <h2>{title}</h2>
            <p>{body}</p>
          </div>
          <div className="hero__actions">
            <Link to="/contact" className="btn btn--secondary">
              Book a session
            </Link>
            <Link to="/waitlist" className="btn btn--primary">
              Join the waitlist
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
