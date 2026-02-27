import { ECOSYSTEM_COLORS, ECOSYSTEM_LABELS, ECOSYSTEM_ORDER } from "@/lib/constants";
import { calculateEcosystemShares, sumEcosystemAreas } from "@/lib/calculations";
import { formatNumber } from "@/lib/format";
import type { EcosystemBreakdown } from "@/types";

interface EcosystemSummaryProps {
  ecosystems: EcosystemBreakdown;
}

export function EcosystemSummary({ ecosystems }: EcosystemSummaryProps) {
  const shares = calculateEcosystemShares(ecosystems);
  const total = sumEcosystemAreas(ecosystems);

  return (
    <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="flex flex-col gap-2 pb-4">
        <h2 className="text-2xl font-semibold text-slate-900">Ocean Ecosystem Extent</h2>
        <p className="text-sm text-slate-600">
          Total of {formatNumber(total, { maximumFractionDigits: 0 })} hectares across
          key marine ecosystem classes.
        </p>
      </header>
      <div className="flex flex-col gap-4">
        {ECOSYSTEM_ORDER.map((key) => {
          const value = ecosystems[key];
          if (value == null) {
            return null;
          }
          const share = shares[key];
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                <span>{ECOSYSTEM_LABELS[key]}</span>
                <span className="text-slate-500">
                  {formatNumber(value, { maximumFractionDigits: 0 })} ha • {share.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(share, 2)}%`,
                    backgroundColor: ECOSYSTEM_COLORS[key],
                  }}
                  aria-hidden
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
