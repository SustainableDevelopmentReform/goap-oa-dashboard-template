import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { NarrativeIntro, NationalData } from "@/types";
import { sumEcosystemAreas } from "@/lib/calculations";
import { formatNumber } from "@/lib/format";

interface HeroSectionProps {
  national: NationalData;
  introduction: NarrativeIntro;
}

export function HeroSection({ national, introduction }: HeroSectionProps) {
  const totalArea = sumEcosystemAreas(national.ecosystems);
  const updatedDate = new Date(introduction.lastUpdated);
  const formattedDate = Number.isNaN(updatedDate.getTime())
    ? introduction.lastUpdated
    : format(updatedDate, "d MMMM yyyy");

  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-white/40 bg-white/90 p-10 shadow-lg">
      <div className="absolute -top-28 right-12 h-64 w-64 rounded-full bg-primary-soft/60 blur-3xl" aria-hidden />
      <div className="relative z-[1] flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="rounded-full border border-primary/50 px-3 py-1 text-xs tracking-wide text-primary">
              Beta
            </span>
            <span>GOAP • Ocean Accounts Dashboard</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
            {introduction.title}
          </h1>
          <div className="space-y-4 text-base leading-relaxed text-slate-600">
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="space-y-4 [&_strong]:text-slate-900">
              {introduction.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex min-w-[240px] flex-col gap-4 rounded-2xl border border-primary/30 bg-primary-soft/60 p-6 text-sm text-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            Ecosystem Extent Snapshot
          </span>
          <span className="text-3xl font-semibold text-slate-900">
            {formatNumber(totalArea, { maximumFractionDigits: 0 })} ha
          </span>
          <div>
            <p className="font-medium text-slate-700">Last updated</p>
            <p className="text-slate-500">{formattedDate}</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Data source</p>
            <p className="text-slate-500">{national.metadata.dataSource}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
