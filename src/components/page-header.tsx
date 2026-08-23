import type { ReactNode } from "react";
import { useEffect } from "react";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  children?: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} — Kerniva`;
  }, [title]);
  return (
    <section className="page-header">
      <div className="container">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
        {children}
      </div>
    </section>
  );
}
