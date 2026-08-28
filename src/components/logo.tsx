import { Link } from "react-router-dom";

/**
 * The Kerniva wordmark. `paper` is the light cut, for the rare dark ground.
 */
export function Logo({
  to = "/",
  height = 22,
  paper = false,
}: {
  to?: string;
  height?: number;
  paper?: boolean;
}) {
  return (
    <Link to={to} className="brand" aria-label="Kerniva home">
      <img
        src={paper ? "/kerniva-wordmark-paper.svg" : "/kerniva-wordmark.svg"}
        alt="Kerniva"
        style={{ height, width: "auto" }}
      />
    </Link>
  );
}
