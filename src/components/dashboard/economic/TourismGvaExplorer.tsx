"use client";

import { useMemo, useState } from "react";
import { line as d3Line, scaleLinear } from "d3";
import type { EconomicSector, EconomicSeriesPoint, EconomicTimeSeries } from "@/types";
import { formatNumber } from "@/lib/format";

const TOTAL_WIDTH = 780;
const TOTAL_HEIGHT = 260;
const TOTAL_MARGIN = { top: 28, right: 24, bottom: 44, left: 64 };

interface TourismGvaExplorerProps {
  data: EconomicTimeSeries;
  sectors: EconomicSector[];
  currency: string;
}

const STATUS_LABEL: Record<string, string> = {
  provisional: "Provisional",
  revised: "Revised",
  final: "Final",
};

const getYearList = (series: EconomicSeriesPoint[]) =>
  [...new Set(series.map((point) => point.year))].sort((a, b) => a - b);

const getLatestPoint = (series: EconomicSeriesPoint[]) =>
  [...series].sort((a, b) => b.year - a.year)[0] ?? null;

const Sparkline = ({
  series,
  color,
}: {
  series: EconomicSeriesPoint[];
  color: string;
}) => {
  const years = useMemo(() => getYearList(series), [series]);
  const [minYear, maxYear] = [years[0], years[years.length - 1]];

  const yValues = series.map((point) => point.value);
  const minValue = Math.min(...yValues);
  const maxValue = Math.max(...yValues);
  const padding = Math.max(Math.abs(minValue), Math.abs(maxValue)) * 0.15;

  const xScale = useMemo(
    () =>
      scaleLinear()
        .domain([minYear, maxYear])
        .range([8, 140]),
    [minYear, maxYear],
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain([minValue - padding, maxValue + padding])
        .range([64, 12]),
    [minValue, maxValue, padding],
  );

  const sparkline = useMemo(
    () =>
      d3Line<EconomicSeriesPoint>()
        .defined((point) => Number.isFinite(point.value))
        .x((point) => xScale(point.year))
        .y((point) => yScale(point.value))(series),
    [series, xScale, yScale],
  );

  const zeroLine = yScale(0);

  return (
    <svg viewBox="0 0 148 72" className="w-full">
      <line x1={8} x2={140} y1={zeroLine} y2={zeroLine} stroke="#e2e8f0" strokeDasharray="4 4" />
      {sparkline ? (
        <path
          d={sparkline}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
};

export function TourismGvaExplorer({ data, sectors, currency }: TourismGvaExplorerProps) {
  const totals = useMemo(() => data.totals ?? [], [data.totals]);
  const totalsYears = useMemo(() => getYearList(totals), [totals]);
  const [minYear, maxYear] = totalsYears.length > 0 ? [totalsYears[0], totalsYears[totalsYears.length - 1]] : [2018, 2022];
  const totalsValues = totals.map((point) => point.value);
  const minTotal = totalsValues.length > 0 ? Math.min(...totalsValues) : 0;
  const maxTotal = totalsValues.length > 0 ? Math.max(...totalsValues) : 100;
  const totalsPadding = Math.max(Math.abs(minTotal), Math.abs(maxTotal)) * 0.15;

  const totalsX = useMemo(
    () =>
      scaleLinear()
        .domain([minYear, maxYear])
        .range([TOTAL_MARGIN.left, TOTAL_WIDTH - TOTAL_MARGIN.right]),
    [minYear, maxYear],
  );

  const totalsY = useMemo(
    () =>
      scaleLinear()
        .domain([minTotal - totalsPadding, maxTotal + totalsPadding])
        .range([TOTAL_HEIGHT - TOTAL_MARGIN.bottom, TOTAL_MARGIN.top]),
    [minTotal, maxTotal, totalsPadding],
  );

  const totalsLine = useMemo(
    () =>
      d3Line<EconomicSeriesPoint>()
        .defined((point) => Number.isFinite(point.value))
        .x((point) => totalsX(point.year))
        .y((point) => totalsY(point.value))(totals),
    [totals, totalsX, totalsY],
  );

  const [hoverYear, setHoverYear] = useState<number | null>(null);
  const displayYear = hoverYear ?? (totalsYears.length > 0 ? totalsYears[totalsYears.length - 1] : maxYear);

  const sectorLookup = useMemo(() => {
    const mapping = new Map<string, EconomicSector>();
    sectors.forEach((sector) => mapping.set(sector.name, sector));
    return mapping;
  }, [sectors]);

  const latestTotals = getLatestPoint(totals);

  const colorPalette = [
    "#1d4ed8",
    "#0f766e",
    "#ea580c",
    "#9333ea",
    "#16a34a",
    "#f97316",
    "#6366f1",
    "#0ea5e9",
  ];

  const handleTotalsPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPosition = event.clientX - rect.left;
    const inverted = totalsX.invert(xPosition);
    const nearest = totalsYears.reduce((closest, current) =>
      Math.abs(current - inverted) < Math.abs(closest - inverted) ? current : closest,
    totalsYears[0]);
    setHoverYear(nearest);
  };

  const handleTotalsPointerLeave = () => setHoverYear(null);

  return (
    <section className="space-y-6 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="flex flex-col gap-2">
        <h3 className="text-xl font-semibold text-slate-900">{data.title}</h3>
        {data.description ? (
          <p className="max-w-3xl text-sm text-slate-600">{data.description}</p>
        ) : null}
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Tourism direct GVA totals ({data.unit})
            </p>
            <p className="text-sm text-slate-500">
              Hover to inspect year values. Negative values in 2020–2021 reflect pandemic losses.
            </p>
          </div>
          <svg
            viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
            role="img"
            aria-label="Tourism GVA totals by year"
            onPointerMove={handleTotalsPointerMove}
            onPointerLeave={handleTotalsPointerLeave}
            className="mt-2 w-full"
          >
            <rect
              x={TOTAL_MARGIN.left}
              y={TOTAL_MARGIN.top}
              width={TOTAL_WIDTH - TOTAL_MARGIN.left - TOTAL_MARGIN.right}
              height={TOTAL_HEIGHT - TOTAL_MARGIN.top - TOTAL_MARGIN.bottom}
              fill="transparent"
            />
            {/* Grid lines */}
            {totalsY.ticks(6).map((value) => (
              <g key={`y-${value}`} transform={`translate(0, ${totalsY(value)})`}>
                <line
                  x1={TOTAL_MARGIN.left}
                  x2={TOTAL_WIDTH - TOTAL_MARGIN.right}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
                <text
                  x={TOTAL_MARGIN.left - 12}
                  textAnchor="end"
                  dy="0.32em"
                  className="text-xs font-medium fill-slate-500"
                >
                  {formatNumber(value, { maximumFractionDigits: 0 })}
                </text>
              </g>
            ))}
            {/* Baseline */}
            <line
              x1={TOTAL_MARGIN.left}
              x2={TOTAL_WIDTH - TOTAL_MARGIN.right}
              y1={totalsY(0)}
              y2={totalsY(0)}
              stroke="#94a3b8"
              strokeDasharray="6 4"
            />
            {/* Line */}
            {totalsLine ? (
              <path
                d={totalsLine}
                fill="none"
                stroke="#0ea5e9"
                strokeWidth={3}
                strokeLinecap="round"
              />
            ) : null}
            {/* Hover marker */}
            {displayYear ? (
              <g>
                <line
                  x1={totalsX(displayYear)}
                  x2={totalsX(displayYear)}
                  y1={TOTAL_MARGIN.top}
                  y2={TOTAL_HEIGHT - TOTAL_MARGIN.bottom}
                  stroke="#0f766e"
                  strokeDasharray="4 4"
                />
                <circle
                  cx={totalsX(displayYear)}
                  cy={totalsY(getSeriesValue(totals, displayYear)?.value ?? 0)}
                  r={5}
                  fill="#0f766e"
                />
              </g>
            ) : null}
            {/* X axis */}
            <line
              x1={TOTAL_MARGIN.left}
              x2={TOTAL_WIDTH - TOTAL_MARGIN.right}
              y1={TOTAL_HEIGHT - TOTAL_MARGIN.bottom}
              y2={TOTAL_HEIGHT - TOTAL_MARGIN.bottom}
              stroke="#cbd5f5"
            />
            {totalsYears.map((year) => (
              <g key={`x-${year}`} transform={`translate(${totalsX(year)}, ${TOTAL_HEIGHT - TOTAL_MARGIN.bottom})`}>
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
          </svg>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {displayYear}
            </span>
            <span className="font-semibold text-slate-900">
              {formatNumber(getSeriesValue(totals, displayYear)?.value ?? 0, {
                maximumFractionDigits: 1,
              })}{" "}
              {data.unit}
            </span>
            {latestTotals && displayYear === latestTotals.year ? (
              <span className="text-xs text-slate-500">
                Status: {STATUS_LABEL[latestTotals.status ?? "final"] ?? latestTotals.status}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex h-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            2022 distribution ({currency} millions)
          </h4>
          <div className="space-y-3">
            {sectors.map((sector) => (
              <div key={sector.name}>
                <div className="flex items-center justify-between text-sm font-medium text-slate-700">
                  <span>{sector.name}</span>
                  <span className="text-xs text-slate-500">
                    {sector.percentage != null ? `${sector.percentage.toFixed(1)}% • ` : ""}
                    {currency} {formatNumber(sector.value, { maximumFractionDigits: 1 })}M
                  </span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, Math.max(sector.percentage ?? 0, 2))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Industry trends (values in {data.unit})
        </h4>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.industries.map((industry, index) => {
            const latest = getLatestPoint(industry.series);
            const baseline = getSeriesValue(industry.series, 2019);
            const delta =
              latest && baseline ? Number((latest.value - baseline.value).toFixed(1)) : null;
            const share = sectorLookup.get(industry.name)?.percentage ?? null;
            const color = colorPalette[index % colorPalette.length];

            return (
              <div
                key={industry.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{industry.name}</p>
                    <p className="text-xs text-slate-500">
                      Share of 2022 direct tourism GVA:{" "}
                      {share != null ? `${share.toFixed(1)}%` : "—"}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {STATUS_LABEL[latest?.status ?? "final"] ?? latest?.status ?? "Final"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Latest ({latest?.year ?? "—"})</span>
                  <span className="font-semibold text-slate-900">
                    {latest ? `${formatNumber(latest.value, { maximumFractionDigits: 1 })}` : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Change vs 2019</span>
                  <span className={delta != null && delta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {delta != null ? `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}` : "—"}
                  </span>
                </div>
                <Sparkline series={industry.series} color={color} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function getSeriesValue(series: EconomicSeriesPoint[], year: number) {
  const exact = series.find((point) => point.year === year);
  if (exact) {
    return exact;
  }
  return null;
}
