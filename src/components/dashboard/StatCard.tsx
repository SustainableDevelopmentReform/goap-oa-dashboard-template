import clsx from "clsx";
import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  highlight?: boolean;
}

export function StatCard({ label, value, description, icon, highlight }: StatCardProps) {
  return (
    <article
      className={clsx(
        "flex flex-col gap-3 rounded-[1.25rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm transition-shadow",
        highlight && "ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {icon ? <span className="text-xl text-primary">{icon}</span> : null}
        <span>{label}</span>
      </div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </article>
  );
}
