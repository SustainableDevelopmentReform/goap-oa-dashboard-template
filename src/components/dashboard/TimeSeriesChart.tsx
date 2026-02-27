"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { extent, max, scaleLinear, line as d3Line, bisector } from "d3";
import type { TimeSeriesData, TimeSeriesPoint } from "@/types";
import { CONFIDENCE_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";

interface TimeSeriesChartProps {
  data: TimeSeriesData;
}

const CHART_WIDTH = 840;
const CHART_HEIGHT = 320;
const MARGIN = { top: 20, right: 24, bottom: 40, left: 56 };

const bisectYear = bisector<TimeSeriesPoint, number>((d) => d.year).left;

export function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const [selectedSeriesName, setSelectedSeriesName] = useState(
    () => data.ecosystems[0]?.name ?? "",
  );
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  const series = useMemo(() => {
    const found = data.ecosystems.find(
      (item) => item.name === selectedSeriesName || item.displayName === selectedSeriesName,
    );
    return found ?? data.ecosystems[0];
  }, [data.ecosystems, selectedSeriesName]);

  const sortedData = useMemo(
    () => [...series.data].sort((a, b) => a.year - b.year),
    [series.data],
  );

  const { path, xScale, yScale } = useMemo(() => {
    const xDomain = extent(sortedData, (d) => d.year) as [number, number];
    const yMax = max(sortedData, (d) => d.value) ?? 0;
    const safeMax = yMax <= 0 ? 1 : yMax;

    const x = scaleLinear().domain(xDomain).range([MARGIN.left, CHART_WIDTH - MARGIN.right]);
    const y = scaleLinear()
      .domain([0, safeMax * 1.1])
      .nice()
      .range([CHART_HEIGHT - MARGIN.bottom, MARGIN.top]);

    const line = d3Line<TimeSeriesPoint>()
      .x((d) => x(d.year))
      .y((d) => y(d.value));

    return {
      path: line(sortedData) ?? undefined,
      xScale: x,
      yScale: y,
    };
  }, [sortedData]);

  const handlePointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const xPosition = event.clientX - bounds.left;
    const yearEstimate = xScale.invert(xPosition);

    const index = bisectYear(sortedData, yearEstimate, 1);
    const previousPoint = sortedData[index - 1];
    const nextPoint = sortedData[index];

    let nearest = previousPoint;
    if (nextPoint && previousPoint) {
      nearest =
        Math.abs(yearEstimate - previousPoint.year) < Math.abs(yearEstimate - nextPoint.year)
          ? previousPoint
          : nextPoint;
    }

    setHoveredPoint(nearest ?? null);
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
  };

  const ticks = useMemo(() => {
    const years: number[] = [];
    const step = Math.ceil((data.endYear - data.startYear) / 5);
    for (let year = data.startYear; year <= data.endYear; year += step) {
      years.push(year);
    }
    if (years[years.length - 1] !== data.endYear) {
      years.push(data.endYear);
    }
    return years;
  }, [data.endYear, data.startYear]);

  return (
    <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 pb-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Temporal Trends</h2>
          <p className="text-sm text-slate-600">
            Historical ecosystem extent from {data.startYear} to {data.endYear}.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          Ecosystem
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-700 shadow-sm focus:border-primary focus:outline-none"
            value={selectedSeriesName}
            onChange={(event) => setSelectedSeriesName(event.target.value)}
          >
            {data.ecosystems.map((item) => (
              <option key={item.name} value={item.name}>
                {item.displayName}
              </option>
            ))}
          </select>
        </label>
      </header>
      <figure className="relative">
        <svg
          width="100%"
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          role="img"
          aria-label={`${series.displayName} extent over time`}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <g>
            {ticks.map((year) => {
              const x = xScale(year);
              return (
                <line
                  key={year}
                  x1={x}
                  y1={MARGIN.top}
                  x2={x}
                  y2={CHART_HEIGHT - MARGIN.bottom}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                />
              );
            })}
          </g>
          <g>
            {yScale.ticks(5).map((value) => {
              const y = yScale(value);
              return (
                <g key={value}>
                  <line
                    x1={MARGIN.left}
                    x2={CHART_WIDTH - MARGIN.right}
                    y1={y}
                    y2={y}
                    stroke="#e2e8f0"
                  />
                  <text
                    x={MARGIN.left - 10}
                    y={y}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fontSize={12}
                    fill="#64748b"
                  >
                    {formatNumber(value, { maximumFractionDigits: 0 })}
                  </text>
                </g>
              );
            })}
          </g>
          <g>
            <line
              x1={MARGIN.left}
              x2={CHART_WIDTH - MARGIN.right}
              y1={CHART_HEIGHT - MARGIN.bottom}
              y2={CHART_HEIGHT - MARGIN.bottom}
              stroke="#cbd5f5"
            />
            {ticks.map((year) => (
              <text
                key={`label-${year}`}
                x={xScale(year)}
                y={CHART_HEIGHT - MARGIN.bottom + 24}
                textAnchor="middle"
                fontSize={12}
                fill="#64748b"
              >
                {year}
              </text>
            ))}
          </g>
          {path ? (
            <path d={path} fill="none" stroke="#0077be" strokeWidth={3} strokeLinecap="round" />
          ) : null}
          {hoveredPoint ? (
            <g>
              <circle
                cx={xScale(hoveredPoint.year)}
                cy={yScale(hoveredPoint.value)}
                r={6}
                fill="#0077be"
              />
            </g>
          ) : null}
        </svg>
        {hoveredPoint ? (
          <div
            className="pointer-events-none absolute left-[var(--hover-x)] top-[var(--hover-y)] -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              "--hover-x": `${xScale(hoveredPoint.year)}px`,
              "--hover-y": `${yScale(hoveredPoint.value)}px`,
            } as CSSProperties}
          >
            <p className="font-semibold text-slate-900">{hoveredPoint.year}</p>
            <p className="text-slate-600">
              {formatNumber(hoveredPoint.value, { maximumFractionDigits: 0 })} ha
            </p>
            <p className="text-slate-400">
              {CONFIDENCE_LABELS[hoveredPoint.confidence] ?? hoveredPoint.confidence}
            </p>
          </div>
        ) : null}
      </figure>
      <details className="mt-6 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-sm text-slate-600">
        <summary className="cursor-pointer select-none font-semibold text-slate-700">
          View data table (accessible alternative)
        </summary>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-white text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-3 py-2">
                  Year
                </th>
                <th scope="col" className="px-3 py-2">
                  Extent (ha)
                </th>
                <th scope="col" className="px-3 py-2">
                  Confidence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {sortedData.map((row) => (
                <tr key={row.year}>
                  <td className="px-3 py-2">{row.year}</td>
                  <td className="px-3 py-2">
                    {formatNumber(row.value, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-3 py-2">
                    {CONFIDENCE_LABELS[row.confidence] ?? row.confidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
