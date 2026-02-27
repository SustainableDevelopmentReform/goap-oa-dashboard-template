"use client";

import { useState } from "react";
import { IndicatorIconScale } from "./IndicatorIconScale";
import type { SocialIndicatorDefinition, SocialMetric, SocialIndicatorId } from "@/types";

interface IslandProfile {
  id: string;
  name: string;
  population: number;
  metrics: Record<SocialIndicatorId, SocialMetric>;
  socioeconomic: {
    households: number | null;
    femaleShare: number | null;
    dependencyRatio: number | null;
    tourismWorkers: number | null;
    tourismShare: number | null;
    fishingHouseholds: number | null;
    oceanResourcesShare: number | null;
  };
}

interface IslandProfileCardProps {
  island: IslandProfile;
  indicators: SocialIndicatorDefinition[];
}

export function IslandProfileCard({
  island,
  indicators,
}: IslandProfileCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div>
          <h3 className="text-lg font-semibold text-slate-800 text-left">
            {island.name}
          </h3>
          <p className="text-sm text-slate-600 text-left">
            Population: {island.population.toLocaleString()}
          </p>
        </div>
        <span
          className={`text-slate-500 transition-transform text-2xl ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-slate-200 p-4 space-y-6">
          {/* Indicators Grid */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Social Indicators
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {indicators.map((indicator) => {
                const metric = island.metrics[indicator.id];
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

          {/* Socioeconomic Stats */}
          <div className="bg-slate-50 rounded p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">
              Demographics &amp; Employment
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {island.socioeconomic.households != null && (
                <div>
                  <div className="text-slate-600">Households</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {island.socioeconomic.households}
                  </div>
                </div>
              )}
              {island.socioeconomic.femaleShare != null && (
                <div>
                  <div className="text-slate-600">Female Share</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {island.socioeconomic.femaleShare.toFixed(1)}%
                  </div>
                </div>
              )}
              {island.socioeconomic.tourismWorkers != null && (
                <div>
                  <div className="text-slate-600">Tourism Workers</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {island.socioeconomic.tourismWorkers}
                  </div>
                </div>
              )}
              {island.socioeconomic.fishingHouseholds != null && (
                <div>
                  <div className="text-slate-600">Fishing Households</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {island.socioeconomic.fishingHouseholds}
                  </div>
                </div>
              )}
              {island.socioeconomic.oceanResourcesShare != null && (
                <div>
                  <div className="text-slate-600">Ocean Resource Share</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {island.socioeconomic.oceanResourcesShare.toFixed(1)}%
                  </div>
                </div>
              )}
              {island.socioeconomic.dependencyRatio != null && (
                <div>
                  <div className="text-slate-600">Dependency Ratio</div>
                  <div className="text-lg font-semibold text-slate-800">
                    {island.socioeconomic.dependencyRatio.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
