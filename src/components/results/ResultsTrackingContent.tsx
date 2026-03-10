"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getReadinessMeta,
  getTriggerSummary,
  readinessChipClass,
  statusChipClass,
} from "@/lib/results";
import { formatNumber } from "@/lib/format";
import type {
  ResultsData,
  ResultsMetric,
  ResultsPilot,
  SpatialConfig,
  SubnationalData,
} from "@/types";

interface ResultsTrackingContentProps {
  results: ResultsData | null;
  spatial: SpatialConfig;
  subnational: SubnationalData;
  initialPilotId?: string | null;
}

const PROVENANCE_URL = "https://csdr.dev.oceandevelopmentdata.org/";

type StageFilter =
  | "all"
  | "baseline"
  | "triggers-defined"
  | "capitalised"
  | "closed";

const formatMetricValue = (
  metric: ResultsMetric,
  kind: "baseline" | "current" | "target",
): string => {
  if (metric.privacy === "private") {
    return "On file (restricted)";
  }

  const point = metric[kind];
  if (!point) {
    return "—";
  }

  if (metric.privacy === "masked") {
    return point.display ?? "On file (masked)";
  }

  if (point.display) {
    return point.display;
  }

  if (typeof point.value === "number") {
    const isSmall = point.value < 1;
    return `${formatNumber(point.value, {
      maximumFractionDigits: isSmall ? 2 : 0,
      minimumFractionDigits: isSmall ? 0 : undefined,
    })}${metric.unit ? ` ${metric.unit}` : ""}`;
  }

  return "—";
};

const summarizeInstrument = (pilot: ResultsPilot) => {
  const { instrument } = pilot;
  const parts = [instrument.type];
  if (instrument.capitalSource) {
    parts.push(instrument.capitalSource);
  }
  if (instrument.governance) {
    parts.push(instrument.governance);
  }
  return parts.join(" • ");
};

const resolveLocationDescription = (
  pilot: ResultsPilot,
  spatial: SpatialConfig,
  subnational: SubnationalData,
) => {
  const location = spatial.locations.find((loc) => loc.id === pilot.id);
  const area = pilot.areaId
    ? subnational.areas.find((candidate) => candidate.id === pilot.areaId)
    : null;

  return location?.description ?? area?.description ?? pilot.summary ?? null;
};

export function ResultsTrackingContent({
  results,
  spatial,
  subnational,
  initialPilotId,
}: ResultsTrackingContentProps) {
  const pilots = useMemo(() => results?.pilots ?? [], [results]);
  const readinessStages = useMemo(() => results?.readinessStages ?? [], [results]);

  const [stageFilter, setStageFilter] = useState<StageFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState(() => {
    if (initialPilotId && pilots.some((pilot) => pilot.id === initialPilotId)) {
      return initialPilotId;
    }
    return pilots[0]?.id ?? "";
  });

  const filteredPilots = useMemo(() => {
    if (stageFilter === "all") {
      return pilots;
    }
    return pilots.filter((pilot) => pilot.readinessStage === stageFilter);
  }, [pilots, stageFilter]);

  useEffect(() => {
    if (!filteredPilots.length) {
      setSelectedId("");
      return;
    }
    const exists = filteredPilots.some((pilot) => pilot.id === selectedId);
    if (!exists) {
      setSelectedId(filteredPilots[0]?.id ?? "");
    }
  }, [filteredPilots, selectedId]);

  const selectedPilot =
    filteredPilots.find((pilot) => pilot.id === selectedId) ?? filteredPilots[0] ?? null;

  const tableRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return pilots;
    return pilots.filter((pilot) => {
      const haystack = [
        pilot.name,
        pilot.instrument.type,
        pilot.instrument.capitalSource,
        pilot.readinessNote,
        pilot.verification?.method,
        pilot.verification?.cadence,
        pilot.disbursement?.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [pilots, searchTerm]);

  if (!results || !pilots.length) {
    return (
      <section className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm">
        <p className="font-semibold text-slate-900">Results tracking data not configured yet</p>
        <p>Provide a results.json file with pilot results profiles to populate this page.</p>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/90 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              <span className="rounded-full border border-primary/40 px-3 py-1 text-[10px]">
                Results tracking
              </span>
              <span>Ocean accounts → results verification</span>
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-semibold text-slate-900">
                Ocean accounts results tracking
              </h1>
              <p className="max-w-3xl text-base leading-relaxed text-slate-600">
                {results.intro.summary}
              </p>
            </div>
            {results.intro.policyHooks?.length ? (
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-primary">
                {results.intro.policyHooks.map((hook) => (
                  <span
                    key={hook}
                    className="rounded-full bg-primary-soft/60 px-3 py-1 text-primary"
                  >
                    {hook}
                  </span>
                ))}
              </div>
            ) : null}
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary-soft/70 p-4 text-sm text-slate-700 shadow-inner">
              <p className="font-semibold text-slate-900">Update cadence</p>
              <p className="text-slate-600">
                Last updated: {results.intro.lastUpdated ?? "TBD"}
              </p>
              <p className="text-xs text-slate-500">
                MRV uses ocean accounts to compress verification costs for results-based instruments.
              </p>
            </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Pilot overview
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Results-based instruments across pilot sites
            </h2>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4">
            <label className="flex w-full max-w-xs flex-col gap-1 text-sm font-medium text-slate-600">
              Filter readiness
              <select
                value={stageFilter}
                onChange={(event) => setStageFilter(event.target.value as StageFilter)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 shadow-sm focus:border-primary focus:outline-none"
              >
                <option value="all">All pilots</option>
                <option value="baseline">Baseline set</option>
                <option value="triggers-defined">Triggers set</option>
                <option value="capitalised">Capitalised</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            {selectedPilot ? (
              <div className="text-xs text-slate-500">
                Showing {filteredPilots.length} pilot{filteredPilots.length === 1 ? "" : "s"}
              </div>
            ) : null}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {filteredPilots.map((pilot) => {
            const readiness = getReadinessMeta(pilot.readinessStage, readinessStages);
            const trigger = getTriggerSummary(pilot);
            return (
              <button
                key={pilot.id}
                type="button"
                onClick={() => setSelectedId(pilot.id)}
                className={clsx(
                  "flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition-shadow",
                  pilot.id === selectedId
                    ? "border-primary/60 bg-primary-soft/70 shadow-md"
                    : "border-slate-200 bg-white/90 hover:shadow-sm",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{pilot.name}</p>
                  <span className={readinessChipClass(readiness.color)}>
                    {readiness.label}
                  </span>
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {pilot.instrument.type}
                </p>
                {pilot.nbSolutionFocus?.length ? (
                  <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-primary">
                    {pilot.nbSolutionFocus.slice(0, 3).map((focus) => (
                      <span key={focus} className="rounded-full bg-primary-soft px-2 py-1">
                        {focus}
                      </span>
                    ))}
                  </div>
                ) : null}
                {trigger ? (
                  <p className="text-xs text-slate-600">
                    Next trigger:{" "}
                    <span className="font-semibold text-slate-900">{trigger.target}</span>{" "}
                    {trigger.nextDue ? `(${trigger.nextDue})` : null}
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>

        {!selectedPilot && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-sm text-slate-600">
            No pilots match this readiness filter yet.
          </div>
        )}
      </section>

      {selectedPilot ? (
        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <article className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <header className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={readinessChipClass(
                    getReadinessMeta(selectedPilot.readinessStage, readinessStages).color,
                  )}
                >
                  {getReadinessMeta(selectedPilot.readinessStage, readinessStages).label}
                </span>
                {selectedPilot.instrument.capitalSource ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {selectedPilot.instrument.capitalSource}
                  </span>
                ) : null}
              </div>
              <h3 className="text-2xl font-semibold text-slate-900">
                {selectedPilot.name}
              </h3>
              <p className="text-sm text-slate-600">
                {selectedPilot.readinessNote ?? selectedPilot.instrument.description}
              </p>
              {selectedPilot.nbSolutionFocus?.length ? (
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-primary">
                  {selectedPilot.nbSolutionFocus.map((focus) => (
                    <span key={focus} className="rounded-full bg-primary-soft/60 px-3 py-1">
                      {focus}
                    </span>
                  ))}
                </div>
              ) : null}
            </header>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Instrument
                </p>
                <p className="mt-1 text-base font-semibold text-slate-900">
                  {selectedPilot.instrument.type}
                </p>
                <p className="text-sm text-slate-600">
                  {summarizeInstrument(selectedPilot)}
                </p>
                {selectedPilot.baselineYear ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Baseline year: {selectedPilot.baselineYear}
                  </p>
                ) : null}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Verification &amp; cadence
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {selectedPilot.verification?.method ?? "Verification pathway"}
                </p>
                <p className="text-sm text-slate-600">
                  {selectedPilot.verification?.cadence ?? "Cadence to be confirmed"}
                </p>
                {selectedPilot.verification?.standard ? (
                  <p className="text-xs text-slate-500">
                    Standard: {selectedPilot.verification.standard}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Payment triggers
                </p>
                <Link
                  href="/spatial"
                  className="text-xs font-semibold text-primary underline decoration-primary/30 underline-offset-4"
                >
                  View in spatial context
                </Link>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {selectedPilot.triggers?.length ? (
                  selectedPilot.triggers.map((trigger) => {
                    const statusClass = statusChipClass(trigger.status);
                    return (
                      <div
                        key={trigger.id}
                        className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50/70 p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {trigger.label}
                          </p>
                          <span className={statusClass}>{trigger.status}</span>
                        </div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {trigger.indicator}
                        </p>
                        <p className="text-sm text-slate-700">
                          Target:{" "}
                          <span className="font-semibold text-slate-900">
                            {trigger.target}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                          {trigger.nextDue ? (
                            <span className="rounded-full bg-white px-2 py-1">
                              Next check: {trigger.nextDue}
                            </span>
                          ) : null}
                          {trigger.evidence ? (
                            <span className="rounded-full bg-white px-2 py-1">
                              Evidence: {trigger.evidence}
                            </span>
                          ) : null}
                          <a
                            href={PROVENANCE_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-white px-2 py-1 text-primary hover:bg-primary/10"
                          >
                            Verify in spatial framework
                          </a>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-600">
                    Define trigger thresholds to activate results-based disbursements.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                  Metrics &amp; baselines
                </p>
                <p className="text-xs text-slate-500">No sensitive capital amounts shown</p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {selectedPilot.metrics?.length ? (
                  selectedPilot.metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/80 p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {metric.label}
                        </p>
                        {metric.status ? (
                          <span className={statusChipClass(metric.status)}>
                            {metric.status}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {metric.unit ?? "Metric"}
                      </p>
                      <div className="mt-1">
                        <a
                          href={PROVENANCE_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-white px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10"
                        >
                          Verify data source
                        </a>
                      </div>
                      <dl className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-600">
                        <div className="rounded-lg bg-white px-2 py-1">
                          <dt className="font-semibold text-slate-500">Baseline</dt>
                          <dd className="font-semibold text-slate-900">
                            {formatMetricValue(metric, "baseline")}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-white px-2 py-1">
                          <dt className="font-semibold text-slate-500">Current</dt>
                          <dd className="font-semibold text-slate-900">
                            {formatMetricValue(metric, "current")}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-white px-2 py-1">
                          <dt className="font-semibold text-slate-500">Target</dt>
                          <dd className="font-semibold text-slate-900">
                            {formatMetricValue(metric, "target")}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">
                    Add indicators (baseline, current, target) to align triggers with MRV.
                  </p>
                )}
              </div>
            </div>
          </article>

          <aside className="flex flex-col gap-3 rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Disbursement
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {selectedPilot.disbursement?.status ?? "Status pending"}
              </p>
              <p className="text-sm text-slate-600">
                Next window: {selectedPilot.disbursement?.nextWindow ?? "TBC"}
              </p>
              {selectedPilot.disbursement?.evidenceRequired ? (
                <p className="text-xs text-slate-500">
                  Evidence: {selectedPilot.disbursement.evidenceRequired}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Governance &amp; partners
              </p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {selectedPilot.instrument.governance ? (
                  <li className="font-semibold text-slate-900">
                    {selectedPilot.instrument.governance}
                  </li>
                ) : null}
                {selectedPilot.partners?.map((partner) => (
                  <li key={partner}>{partner}</li>
                ))}
              </ul>
              {selectedPilot.communities?.length ? (
                <div className="mt-2 text-xs text-slate-600">
                  Communities: {selectedPilot.communities.join(", ")}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                Replication &amp; notes
              </p>
              <p className="text-sm text-slate-700">
                {resolveLocationDescription(selectedPilot, spatial, subnational)}
              </p>
              {selectedPilot.replication?.length ? (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">
                  {selectedPilot.replication.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </aside>
        </section>
      ) : null}

      <section className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
              Cross-pilot readiness
            </p>
            <input
              type="search"
              placeholder="Search pilots, instruments, cadence…"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full max-w-xs rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-primary focus:outline-none"
            />
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-primary underline decoration-primary/30 underline-offset-4"
          >
            Back to dashboard
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700">
            <thead className="text-xs uppercase tracking-wide text-slate-500">
              <tr className="text-left">
                <th className="px-3 py-2">Pilot</th>
                <th className="px-3 py-2">Readiness</th>
                <th className="px-3 py-2">Instrument</th>
                <th className="px-3 py-2">Next window</th>
                <th className="px-3 py-2">MRV cadence</th>
                <th className="px-3 py-2">Next trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tableRows.map((pilot) => {
                const readiness = getReadinessMeta(pilot.readinessStage, readinessStages);
                const trigger = getTriggerSummary(pilot);
                return (
                  <tr key={pilot.id}>
                    <td className="px-3 py-2 font-semibold text-slate-900">{pilot.name}</td>
                    <td className="px-3 py-2">
                      <span className={readinessChipClass(readiness.color)}>
                        {readiness.label}
                      </span>
                    </td>
                    <td className="px-3 py-2">{pilot.instrument.type}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {pilot.disbursement?.nextWindow ?? "TBC"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {pilot.verification?.cadence ?? "TBC"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {trigger ? `${trigger.target}${trigger.nextDue ? ` (${trigger.nextDue})` : ""}` : "TBC"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
