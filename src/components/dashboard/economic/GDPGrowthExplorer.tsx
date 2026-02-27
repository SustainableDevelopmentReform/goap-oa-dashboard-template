"use client";

import { useMemo, useState } from "react";
import { bisector, extent, line as d3Line, scaleLinear } from "d3";
import type { EconomicIndustrySeries, EconomicSeriesPoint, EconomicTimeSeries } from "@/types";
import { formatNumber } from "@/lib/format";

const WIDTH = 880;
const HEIGHT = 420;
const MARGIN = { top: 32, right: 24, bottom: 48, left: 64 };

const COLOR_PALETTE = [
  "#1d4ed8",
  "#0f766e",
  "#ea580c",
  "#9333ea",
  "#dc2626",
  "#0ea5e9",
  "#16a34a",
  "#f59e0b",
  "#8b5cf6",
  "#22c55e",
  "#0891b2",
  "#f97316",
  "#be123c",
  "#2563eb",
  "#047857",
  "#b45309",
  "#7c3aed",
  "#f43f5e",
  "#14b8a6",
  "#65a30d",
  "#d97706",
  "#7c2d12",
];

const STATUS_LABEL: Record<string, string> = {
  provisional: "Provisional",
  revised: "Revised",
  final: "Final",
};

const getSeriesValue = (series: EconomicSeriesPoint[], year: number) => {
  const exact = series.find((point) => point.year === year);
  if (exact) {
    return exact;
  }
  const sorted = [...series].sort((a, b) => Math.abs(a.year - year) - Math.abs(b.year - year));
  return sorted[0] ?? null;
};

const buildColorScale = (industries: EconomicIndustrySeries[]) => {
  const domain = industries.map((industry) => industry.id);
  const scale = new Map<string, string>();
  domain.forEach((id, index) => {
    scale.set(id, COLOR_PALETTE[index % COLOR_PALETTE.length]);
  });
  return scale;
};

interface GDPGrowthExplorerProps {
  data: EconomicTimeSeries;
}

export function GDPGrowthExplorer({ data }: GDPGrowthExplorerProps) {

  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>();
    data.industries.forEach((industry) => {
      if (industry.group) {
        groups.add(industry.group);
      }
    });
    const sorted = Array.from(groups).sort((a, b) => a.localeCompare(b));
    sorted.unshift("All industries");
    return sorted;
  }, [data.industries]);

  const defaultGroup = useMemo(() => {
    if (uniqueGroups.includes("Tourism")) {
      return "Tourism";
    }
    if (uniqueGroups.includes("Primary production")) {
      return "Primary production";
    }
    return uniqueGroups[0];
  }, [uniqueGroups]);

  const [selectedGroup, setSelectedGroup] = useState(defaultGroup);

  const filteredIndustries = useMemo(() => {
    if (selectedGroup === "All industries") {
      return data.industries;
    }
    const groupMatches = data.industries.filter(
      (industry) => industry.group === selectedGroup || industry.id === "real-gdp",
    );
    // Deduplicate by id to avoid double-counting real GDP.
    const seen = new Set<string>();
    return groupMatches.filter((industry) => {
      if (seen.has(industry.id)) {
        return false;
      }
      seen.add(industry.id);
      return true;
    });
  }, [data.industries, selectedGroup]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    filteredIndustries.forEach((industry) => {
      industry.series.forEach((point) => yearSet.add(point.year));
    });
    const sorted = Array.from(yearSet).sort((a, b) => a - b);
    return sorted.length > 0 ? sorted : [2022];
  }, [filteredIndustries]);

  const xScale = useMemo(() => {
    const [minYear, maxYear] = extent(years) as [number, number];
    return scaleLinear()
      .domain([minYear, maxYear])
      .range([MARGIN.left, WIDTH - MARGIN.right]);
  }, [years]);

  const yDomain = useMemo(() => {
    const values = filteredIndustries.flatMap((industry) =>
      industry.series.map((point) => point.value),
    );
    if (values.length === 0) {
      return [-10, 10];
    }
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 0.1;
    return [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];
  }, [filteredIndustries]);

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain(yDomain)
        .range([HEIGHT - MARGIN.bottom, MARGIN.top]),
    [yDomain],
  );

  const lineGenerator = useMemo(
    () =>
      d3Line<EconomicSeriesPoint>()
        .defined((point) => Number.isFinite(point.value))
        .x((point) => xScale(point.year))
        .y((point) => yScale(point.value)),
    [xScale, yScale],
  );

  const colorScale = useMemo(() => buildColorScale(data.industries), [data.industries]);

  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const bisectYears = useMemo(() => bisector((year: number) => year).center, []);

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const xPosition = event.clientX - rect.left;
    const inverted = xScale.invert(xPosition);
    const nearest = bisectYears(years, inverted);
    setHoverYear(years[nearest] ?? years[years.length - 1]);
  };

  const handlePointerLeave = () => {
    setHoverYear(null);
  };

  const displayYear = hoverYear ?? years[years.length - 1];

  const summaryRows = useMemo(
    () =>
      filteredIndustries
        .map((industry) => {
          const point = getSeriesValue(industry.series, displayYear);
          return {
            id: industry.id,
            name: industry.name,
            group: industry.group ?? "Other industries",
            value: point?.value ?? null,
            status: point?.status ?? undefined,
          };
        })
        .sort((a, b) => (b.value ?? Number.NEGATIVE_INFINITY) - (a.value ?? Number.NEGATIVE_INFINITY)),
    [displayYear, filteredIndustries],
  );

  const zeroY = yScale(0);

  return (
    <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="flex flex-col gap-2 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{data.title}</h3>
            {data.description ? (
              <p className="max-w-3xl text-sm text-slate-600">{data.description}</p>
            ) : null}
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            Focus group
            <select
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 shadow-sm focus:border-primary focus:outline-none"
              value={selectedGroup}
              onChange={(event) => setSelectedGroup(event.target.value)}
            >
              {uniqueGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/80 p-4">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label="Real GDP growth by industry"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="h-full w-full"
          >
            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={WIDTH - MARGIN.left - MARGIN.right}
              height={HEIGHT - MARGIN.top - MARGIN.bottom}
              fill="transparent"
            />

            {/* Horizontal axis */}
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={HEIGHT - MARGIN.bottom}
              y2={HEIGHT - MARGIN.bottom}
              stroke="#cbd5f5"
            />
            {years.map((year) => (
              <g key={`x-${year}`} transform={`translate(${xScale(year)}, ${HEIGHT - MARGIN.bottom})`}>
                <line y2="6" stroke="#cbd5f5" />
                <text
                  y={24}
                  textAnchor="middle"
                  className="text-xs font-medium fill-slate-500"
                >
                  {year}
                </text>
              </g>
            ))}

            {/* Vertical grid */}
            {yScale.ticks(8).map((value) => (
              <g key={`y-${value}`} transform={`translate(0, ${yScale(value)})`}>
                <line
                  x1={MARGIN.left}
                  x2={WIDTH - MARGIN.right}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={MARGIN.left - 12}
                  textAnchor="end"
                  dy="0.32em"
                  className="text-xs font-medium fill-slate-500"
                >
                  {formatNumber(value, { maximumFractionDigits: 0 })}
                </text>
              </g>
            ))}

            {/* Zero baseline */}
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={zeroY}
              y2={zeroY}
              stroke="#94a3b8"
              strokeDasharray="6 4"
            />

            {/* Lines */}
            {filteredIndustries.map((industry) => {
              const path = lineGenerator(industry.series);
              if (!path) {
                return null;
              }
              const color =
                industry.id === "real-gdp"
                  ? "#111827"
                  : colorScale.get(industry.id) ?? "#2563eb";
              const strokeWidth = industry.id === "real-gdp" ? 3 : 1.8;
              const opacity = industry.id === "real-gdp" ? 1 : 0.9;
              return (
                <path
                  key={industry.id}
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={opacity}
                />
              );
            })}

            {/* Hover marker */}
            {displayYear ? (
              <g>
                <line
                  x1={xScale(displayYear)}
                  x2={xScale(displayYear)}
                  y1={MARGIN.top}
                  y2={HEIGHT - MARGIN.bottom}
                  stroke="#0369a1"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={xScale(displayYear)}
                  cy={yScale(0)}
                  r={4}
                  fill="#0369a1"
                />
                <text
                  x={xScale(displayYear)}
                  y={MARGIN.top - 12}
                  textAnchor="middle"
                  className="text-xs font-semibold fill-slate-700"
                >
                  {displayYear}
                </text>
              </g>
            ) : null}
          </svg>
          <p className="absolute bottom-3 right-4 text-xs text-slate-400">
            Hover over the chart to inspect individual year growth rates.
          </p>
        </div>

        <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {displayYear} growth snapshot
          </h4>
          <div className="flex flex-wrap gap-2">
            {filteredIndustries.slice(0, 12).map((industry) => {
              const color =
                industry.id === "real-gdp"
                  ? "#111827"
                  : colorScale.get(industry.id) ?? "#2563eb";
              return (
                <span
                  key={`legend-${industry.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-600"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                  {industry.name}
                </span>
              );
            })}
            {filteredIndustries.length > 12 ? (
              <span className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-medium text-slate-500">
                +{filteredIndustries.length - 12} more
              </span>
            ) : null}
          </div>
          <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-inner">
            <table className="w-full min-w-[260px] text-sm text-slate-600">
              <thead className="sticky top-0 bg-white text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Industry</th>
                  <th className="px-4 py-2 text-right">Growth (%)</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {summaryRows.map((row) => (
                  <tr key={`summary-${row.id}`} className="border-t border-slate-100">
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-700">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.group}</p>
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900">
                      {row.value != null ? row.value.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {row.status ? STATUS_LABEL[row.status] ?? row.status : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
