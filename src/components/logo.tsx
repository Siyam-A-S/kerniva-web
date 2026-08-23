import { Link } from "react-router-dom";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="brand" aria-label="Kerniva home">
      <img className="brand__mark" src="/logo-mark.svg" alt="" />
      <span>Kerniva</span>
    </Link>
  );
}
