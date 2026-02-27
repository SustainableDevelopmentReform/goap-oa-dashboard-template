import { formatCurrency, formatNumber } from "@/lib/format";
import { sortIndicators } from "@/lib/calculations";
import type { EconomicData } from "@/types";
import { GDPGrowthExplorer } from "./economic/GDPGrowthExplorer";
import { TourismGvaExplorer } from "./economic/TourismGvaExplorer";

interface EconomicHighlightsProps {
  economic: EconomicData;
}

const formatIndicatorValue = (value: number, unit: string, currency: string) => {
  if (unit === "percent") {
    return `${value.toFixed(1)}%`;
  }
  if (unit === "millions") {
    return `${currency} ${formatNumber(value, { maximumFractionDigits: 0 })}M`;
  }
  if (unit === "number") {
    return formatNumber(value, { maximumFractionDigits: 0 });
  }
  return formatCurrency(value, currency);
};

export function EconomicHighlights({ economic }: EconomicHighlightsProps) {
  const indicators = sortIndicators(economic.indicators);
  const totalSectorValue = economic.sectors.reduce((acc, sector) => acc + sector.value, 0);
  const formatSectorValue = (value: number, unit: string) => {
    if (unit === "millions") {
      return `${economic.currency} ${formatNumber(value, { maximumFractionDigits: 0 })}M`;
    }
    if (unit === "percent") {
      return `${value.toFixed(1)}%`;
    }
    if (unit === "number") {
      return formatNumber(value, { maximumFractionDigits: 0 });
    }
    return `${economic.currency} ${formatNumber(value, { maximumFractionDigits: 0 })}`;
  };

  return (
    <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="flex flex-col gap-2 pb-4">
        <h2 className="text-2xl font-semibold text-slate-900">Economic Highlights</h2>
        <p className="text-sm text-slate-600">
          Snapshot of ocean-linked economic indicators for {economic.referenceYear}.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {indicators.map(([key, indicator]) => (
          <div key={key} className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {indicator.description}
            </span>
            <span className="text-xl font-semibold text-slate-900">
              {formatIndicatorValue(indicator.value, indicator.unit, economic.currency)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Sector Distribution
          </h3>
          <div className="mt-3 space-y-3">
            {economic.sectors.map((sector) => {
              const share =
                sector.percentage != null
                  ? sector.percentage
                  : totalSectorValue > 0
                  ? (sector.value / totalSectorValue) * 100
                  : 0;
              return (
                <div key={sector.name}>
                  <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                    <span>{sector.name}</span>
                    <span className="text-xs text-slate-500">
                      {share.toFixed(1)}% • {formatSectorValue(sector.value, sector.unit)}
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max(share, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {economic.gdpGrowth ? (
        <div className="mt-10">
          <GDPGrowthExplorer data={economic.gdpGrowth} />
        </div>
      ) : null}
      {economic.tourismGva ? (
        <div className="mt-10">
          <TourismGvaExplorer
            data={economic.tourismGva}
            sectors={economic.sectors.filter((s) => s.name.toLowerCase().includes("tourism"))}
            currency={economic.currency}
          />
        </div>
      ) : null}
    </section>
  );
}
