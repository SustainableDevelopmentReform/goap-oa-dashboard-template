// Client-side to allow ecosystem switching
"use client";

import { useEffect, useMemo, useState } from "react";
import { ServiceMetricCard } from "@/components/dashboard/services/ServiceMetricCard";
import { getMaxMetricYear, normalizeServiceGroups, reorderMetrics } from "@/lib/services";
import type { EcosystemServiceGroup, EcosystemServicesData } from "@/types";

interface NationalEcosystemServicesAccountProps {
  services?: EcosystemServicesData;
}

export function NationalEcosystemServicesAccount({
  services,
}: NationalEcosystemServicesAccountProps) {
  const ecosystems = useMemo(
    () => normalizeServiceGroups(services?.ecosystems),
    [services?.ecosystems],
  );
  const [selectedId, setSelectedId] = useState<string>(ecosystems[0]?.ecosystem ?? "");

  const selected: EcosystemServiceGroup | null =
    ecosystems.find((group) => group.ecosystem === selectedId) ?? ecosystems[0] ?? null;

  useEffect(() => {
    if (ecosystems.length === 0) {
      setSelectedId("");
      return;
    }
    const exists = ecosystems.some((group) => group.ecosystem === selectedId);
    if (!exists) {
      setSelectedId(ecosystems[0]?.ecosystem ?? "");
    }
  }, [ecosystems, selectedId]);

  if (!services || ecosystems.length === 0) {
    return null;
  }

  const latestYear = getMaxMetricYear(selected?.metrics);

  return (
    <section className="flex flex-col gap-6 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Ecosystem Services Account
        </p>
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-semibold text-slate-900">
            Services value across ecosystem types
          </h2>
          <p className="text-sm text-slate-600">
            Compare ecosystem service indicators across ecosystem types and years available in the
            template dataset.
          </p>
        </div>
      </header>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex w-full max-w-sm flex-col gap-1 text-sm font-medium text-slate-600">
          Select ecosystem
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 shadow-sm focus:border-primary focus:outline-none"
            value={selected?.ecosystem ?? ""}
            onChange={(event) => setSelectedId(event.target.value)}
          >
            {ecosystems.map((group) => (
              <option key={group.ecosystem} value={group.ecosystem}>
                {group.ecosystemLabel}
              </option>
            ))}
          </select>
        </label>
        {latestYear ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Latest year shown: {latestYear}
          </p>
        ) : null}
      </div>

      {selected ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reorderMetrics(selected.metrics).map((metric) => (
            <ServiceMetricCard key={`${selected.ecosystem}-${metric.id}`} metric={metric} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
          Select an ecosystem to view its services account.
        </div>
      )}

      {services.metadata ? (
        <footer className="rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500">
          {services.metadata.dataSource ? (
            <p>
              <span className="font-semibold text-slate-600">Source:</span>{" "}
              {services.metadata.dataSource}
            </p>
          ) : null}
          {services.metadata.methodology ? (
            <p className="mt-1">{services.metadata.methodology}</p>
          ) : null}
          {services.metadata.notes ? (
            <p className="mt-1 text-slate-400">{services.metadata.notes}</p>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
