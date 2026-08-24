import { Link } from "react-router-dom";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__grid">
          <div>
            <Logo />
            <p style={{ marginTop: 14, maxWidth: "34ch" }}>
              Private multiplayer AI workspaces for sensitive teams. Built on AWS, governed by
              design.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li>
                <Link to="/product">Workspace</Link>
              </li>
              <li>
                <Link to="/research">Research &amp; thesis</Link>
              </li>
              <li>
                <Link to="/security">Security</Link>
              </li>
              <li>
                <Link to="/pricing">Pricing</Link>
              </li>
              <li>
                <Link to="/waitlist">Simulation waitlist</Link>
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
                <Link to="/solutions#legal">Legal &amp; compliance</Link>
              </li>
              <li>
                <Link to="/solutions#consulting">Consulting &amp; advisory</Link>
              </li>
              <li>
                <Link to="/research">Universities &amp; labs</Link>
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
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <a href="mailto:hello@kerniva.app">hello@kerniva.app</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="site-footer__bar">
          <span>© {new Date().getFullYear()} Kerniva. All rights reserved.</span>
          <span>
            <Link to="/privacy">Privacy</Link> · kerniva.app
          </span>
        </div>
      </div>
    </footer>
  );
}
