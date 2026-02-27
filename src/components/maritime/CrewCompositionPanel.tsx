import type { CrewData } from "@/types";

interface CrewCompositionPanelProps {
  crewData: CrewData;
}

const toSortedEntries = (values: Record<string, number>) =>
  Object.entries(values).sort((a, b) => b[1] - a[1]);

const normaliseNationality = (value: string) => value.trim().toLowerCase();

export function CrewCompositionPanel({ crewData }: CrewCompositionPanelProps) {
  const totalCrew = crewData.metadata.totalCrewCount;

  const domesticCrewCount = Object.entries(crewData.nationalityBreakdown).reduce(
    (sum, [nationality, count]) => {
      const normalized = normaliseNationality(nationality);
      if (normalized === "domestic" || normalized === "gen" || normalized === "national") {
        return sum + count;
      }
      return sum;
    },
    0,
  );

  const domesticShare = totalCrew > 0 ? (domesticCrewCount / totalCrew) * 100 : 0;
  const internationalShare = 100 - domesticShare;
  const rankEntries = toSortedEntries(crewData.rankDistribution).slice(0, 6);
  const nationalityEntries = toSortedEntries(crewData.nationalityBreakdown);

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="text-lg font-semibold text-slate-800">Crew composition</h3>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label="Domestic"
          value={domesticCrewCount.toLocaleString()}
          helper={`${domesticShare.toFixed(1)}% of crew`}
          tone="blue"
        />
        <SummaryCard
          label="International"
          value={Math.max(totalCrew - domesticCrewCount, 0).toLocaleString()}
          helper={`${internationalShare.toFixed(1)}% of crew`}
          tone="slate"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nationality share</p>
        {nationalityEntries.map(([label, count]) => {
          const share = totalCrew > 0 ? (count / totalCrew) * 100 : 0;
          return (
            <div key={label} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{label}</span>
                <span>
                  {count.toLocaleString()} ({share.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-blue-500" style={{ width: `${share}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Rank distribution</p>
        {rankEntries.map(([rank, count]) => {
          const share = totalCrew > 0 ? (count / totalCrew) * 100 : 0;
          return (
            <div key={rank} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>{rank}</span>
                <span>{count.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-500" style={{ width: `${share}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
        Total crew tracked: <span className="font-semibold text-slate-900">{totalCrew.toLocaleString()}</span>
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "slate";
}) {
  const className =
    tone === "blue"
      ? "border-blue-100 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-lg border p-3 text-center ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[11px]">{helper}</p>
    </div>
  );
}
