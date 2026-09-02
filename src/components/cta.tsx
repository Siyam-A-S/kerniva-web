import { Link } from "react-router-dom";
import { Corners } from "./blueprint";
import { BTN_BOOK_DEMO, BTN_JOIN_WAITLIST, CTA_DEFAULT } from "../content";

export function Cta({
  title = CTA_DEFAULT.title,
  body = CTA_DEFAULT.body,
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
              {BTN_JOIN_WAITLIST}
            </Link>
            <Link to="/demo" className="btn btn--primary btn--lg blueprint">
              <Corners />
              {BTN_BOOK_DEMO}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
