import { Link } from "react-router-dom";
import { SectionLink } from "./section-link";

/**
 * The design's footer is a single status row. The link columns above it are
 * kept so the pages that are not sections of the landing stay reachable.
 */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <h4>Product</h4>
            <ul>
              <li>
                <Link to="/product">Workspace</Link>
              </li>
              <li>
                <Link to="/research">Research and thesis</Link>
              </li>
              <li>
                <Link to="/security">Security</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Solutions</h4>
            <ul>
              <li>
                <Link to="/solutions">Enterprise teams</Link>
              </li>
              <li>
                <Link to="/solutions#legal">Legal and compliance</Link>
              </li>
              <li>
                <Link to="/solutions#consulting">Consulting and advisory</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link to="/about">About</Link>
              </li>
              <li>
                <SectionLink hash="faq">FAQ</SectionLink>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <a href="mailto:hello@kerniva.app">hello@kerniva.app</a>
              </li>
            </ul>
          </div>
          <div>
            <h4>Get started</h4>
            <ul>
              <li>
                <Link to="/demo">Book a demo</Link>
              </li>
              <li>
                <Link to="/waitlist">Join the waitlist</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bar">
          <img src="/kerniva-wordmark.svg" alt="Kerniva" />
          <span>AI workspace for teams with no time to lose</span>
          <span className="end">
            © {new Date().getFullYear()} Kerniva · <Link to="/privacy">Privacy</Link> ·{" "}
            <Link to="/privacy">Terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
