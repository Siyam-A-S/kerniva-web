import { Link } from "react-router-dom";

export function Cta({
  title = "See Kerniva on your own material",
  body = "Book a working session with our team, or join the waitlist for the live simulation: a real Kerniva workspace of your own, no account needed.",
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
