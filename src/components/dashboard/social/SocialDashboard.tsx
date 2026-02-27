import { IndicatorIconScale } from "./IndicatorIconScale";
import { IslandProfileCard } from "./IslandProfileCard";
import type { SocioeconomicData } from "@/types";

interface SocialDashboardProps {
  data: SocioeconomicData;
}

export function SocialDashboard({ data }: SocialDashboardProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Social Indicators &amp; Profiles
        </h2>
        <p className="text-slate-600">
          Key socioeconomic metrics for {data.atollName} and its islands
        </p>
      </div>

      {/* Atoll-Level Summary */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-700 mb-4">
          {data.atollName} - Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.indicators.map((indicator) => {
            const metric = data.atollAverages[indicator.id];
            if (!metric || metric.value === null) return null;
            return (
              <IndicatorIconScale
                key={indicator.id}
                icon={indicator.icon}
                iconCount={metric.iconCount ?? 1}
                label={indicator.label}
                value={Math.round(metric.value * 10) / 10}
                unit={indicator.unit}
                tier={metric.tier ?? "low"}
              />
            );
          })}
        </div>
      </div>

      {/* Island-Level Profiles */}
      <div>
        <h3 className="text-xl font-semibold text-slate-700 mb-4">
          Island Profiles
        </h3>
        <div className="space-y-4">
          {data.islands.map((island) => (
            <IslandProfileCard
              key={island.id}
              island={island}
              indicators={data.indicators}
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mt-8 p-4 bg-slate-100 rounded text-sm text-slate-600">
        <p>
          <strong>Last Updated:</strong> {data.lastUpdated}
        </p>
        {data.notes ? <p className="mt-2">{data.notes}</p> : null}
      </div>
    </section>
  );
}
