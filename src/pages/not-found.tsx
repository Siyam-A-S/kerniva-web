import { Link } from "react-router-dom";
import { PageHeader } from "../components/page-header";

export function NotFoundPage() {
  return (
    <PageHeader eyebrow="404" title="That page does not exist." lede="The link may be out of date.">
      <Link to="/" className="btn btn--secondary" style={{ marginTop: 24 }}>
        Back to home
      </Link>
    </PageHeader>
  );
}
