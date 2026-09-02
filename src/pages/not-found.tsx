import { Link } from "react-router-dom";
import { PageHeader } from "../components/page-header";
import { NOT_FOUND } from "../content";

export function NotFoundPage() {
  return (
    <PageHeader eyebrow={NOT_FOUND.eyebrow} title={NOT_FOUND.title} lede={NOT_FOUND.lede}>
      <Link to="/" className="btn btn--secondary" style={{ marginTop: 24 }}>
        {NOT_FOUND.back}
      </Link>
    </PageHeader>
  );
}
