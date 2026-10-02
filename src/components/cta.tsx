import { Link } from "react-router-dom";
import { Corners } from "./blueprint";
import { BTN_BOOK_DEMO, BTN_OPEN_WORKSPACE, CTA_DEFAULT, LIVE_URL } from "../content";

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
            <a href={LIVE_URL} className="btn btn--secondary btn--lg">
              {BTN_OPEN_WORKSPACE}
            </a>
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
