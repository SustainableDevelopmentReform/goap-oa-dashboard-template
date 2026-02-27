"use client";

import { useMemo, useState } from "react";
import { ShippingKPIGrid } from "./ShippingKPIGrid";
import { VesselRegistry } from "./VesselRegistry";
import { CrewCompositionPanel } from "./CrewCompositionPanel";
import { PortTrafficPanel } from "./PortTrafficPanel";
import type { CrewData, MaritimeFleet, MaritimeOverview, TrafficData, Vessel } from "@/types";

interface MaritimeDashboardProps {
  overview: MaritimeOverview;
  fleet: MaritimeFleet;
  crew: CrewData;
  traffic: TrafficData;
}

type FleetScope = "all" | "domestic";

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
};

const getMostCommonFlag = (vessels: Vessel[]): string | null => {
  const counts = new Map<string, number>();
  vessels.forEach((vessel) => {
    counts.set(vessel.flag, (counts.get(vessel.flag) ?? 0) + 1);
  });
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
};

const buildScopeAwareKpis = (
  base: MaritimeOverview["kpis"],
  vessels: Vessel[],
): MaritimeOverview["kpis"] => {
  const total = vessels.length;
  const active = vessels.filter((vessel) => vessel.status === "active").length;
  const totalTonnage = vessels.reduce((sum, vessel) => sum + vessel.grossTonnage, 0);
  const crewTotal = vessels.reduce((sum, vessel) => sum + (vessel.crewCount ?? 0), 0);
  const domesticCrewTotal = vessels.reduce((sum, vessel) => sum + (vessel.domesticCrew ?? 0), 0);
  const averageAge = vessels
    .map((vessel) => vessel.yearBuilt)
    .filter((year): year is number => typeof year === "number")
    .reduce((sum, year, _, arr) => {
      const currentYear = new Date().getFullYear();
      return sum + (currentYear - year) / arr.length;
    }, 0);

  return {
    ...base,
    fleetTotal: {
      ...(base.fleetTotal ?? {
        unit: "vessels",
        description: "Total registered vessels in selected scope",
      }),
      value: total,
    },
    activeFleet: {
      ...(base.activeFleet ?? {
        unit: "vessels",
        description: "Active vessels in selected scope",
      }),
      value: active,
    },
    totalTonnage: {
      ...(base.totalTonnage ?? {
        unit: "gross tonnage",
        description: "Combined gross tonnage in selected scope",
      }),
      value: totalTonnage,
    },
    crewTotal: {
      ...(base.crewTotal ?? {
        unit: "seafarers",
        description: "Crew onboard in selected scope",
      }),
      value: crewTotal,
    },
    domesticCrewShare: {
      ...(base.domesticCrewShare ?? {
        unit: "%",
        description: "Domestic crew share in selected scope",
      }),
      value: crewTotal > 0 ? (domesticCrewTotal / crewTotal) * 100 : 0,
    },
    averageFleetAge: {
      ...(base.averageFleetAge ?? {
        unit: "years",
        description: "Average age of vessels in selected scope",
      }),
      value: averageAge,
    },
  };
};

export function MaritimeDashboard({
  overview,
  fleet,
  crew,
  traffic,
}: MaritimeDashboardProps) {
  const [scope, setScope] = useState<FleetScope>("all");

  const domesticFlag = useMemo(() => getMostCommonFlag(fleet.vessels), [fleet.vessels]);

  const scopedVessels = useMemo(() => {
    if (scope === "all") {
      return fleet.vessels;
    }

    if (!domesticFlag) {
      return [];
    }

    return fleet.vessels.filter((vessel) => vessel.flag === domesticFlag);
  }, [domesticFlag, fleet.vessels, scope]);

  const scopedKpis = useMemo(
    () => buildScopeAwareKpis(overview.kpis, scopedVessels),
    [overview.kpis, scopedVessels],
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-slate-800">Maritime Fleet Overview</h2>
          <p className="text-slate-600">
            Fleet performance, vessel operations, crew composition, and port traffic trends.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Fleet scope</p>
          <div className="mt-2 inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setScope("all")}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                scope === "all" ? "bg-white text-primary shadow-sm" : "text-slate-600"
              }`}
            >
              All vessels
            </button>
            <button
              type="button"
              onClick={() => setScope("domestic")}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                scope === "domestic" ? "bg-white text-primary shadow-sm" : "text-slate-600"
              }`}
            >
              Domestic
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold text-slate-700">Key performance indicators</h3>
        <ShippingKPIGrid kpis={scopedKpis} />
      </div>

      {overview.economic && (
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {overview.economic.fleetValue && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-2 text-sm font-medium text-slate-600">Fleet value</div>
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(overview.economic.fleetValue.value)}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {overview.economic.fleetValue.asGdpPercentage}% of GDP
              </div>
            </div>
          )}

          {overview.economic.annualRevenue && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-2 text-sm font-medium text-slate-600">Annual revenue</div>
              <div className="text-2xl font-bold text-slate-800">
                {formatCurrency(overview.economic.annualRevenue.value)}
              </div>
              <div className="mt-1 text-xs text-slate-600">USD per year</div>
            </div>
          )}

          {overview.economic.employmentContribution && (
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <div className="mb-2 text-sm font-medium text-slate-600">Employment</div>
              <div className="text-2xl font-bold text-slate-800">
                {(overview.economic.employmentContribution.value / 1000).toFixed(1)}K
              </div>
              <div className="mt-1 text-xs text-slate-600">Full-time equivalent jobs</div>
            </div>
          )}
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-xl font-semibold text-slate-700">Vessel registry</h3>
          <VesselRegistry vessels={scopedVessels} />
        </div>

        <div>
          <CrewCompositionPanel crewData={crew} />
        </div>
      </div>

      <PortTrafficPanel data={traffic} />

      <div className="mt-8 rounded bg-slate-100 p-4 text-sm text-slate-600">
        <p>
          <strong>Data year:</strong> {overview.metadata.dataYear} | <strong>Country:</strong>{" "}
          {overview.metadata.country}
        </p>
      </div>
    </section>
  );
}
