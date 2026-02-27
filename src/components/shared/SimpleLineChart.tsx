"use client";

import { formatNumber } from "@/lib/format";

interface SimpleLineChartPoint {
  year: number;
  value: number;
}

interface SimpleLineChartProps {
  points: SimpleLineChartPoint[];
  valueLabel?: string;
}

export function SimpleLineChart({ points, valueLabel }: SimpleLineChartProps) {
  if (points.length === 0) {
    return <p className="text-sm text-slate-500">No data available.</p>;
  }

  const width = 320;
  const height = 160;
  const padding = 24;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const xStep = (width - padding * 2) / Math.max(points.length - 1, 1);

  const path = points
    .map((point, index) => {
      const x = padding + index * xStep;
      const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-2">
      {valueLabel ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{valueLabel}</p>
      ) : null}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        <rect x="0" y="0" width={width} height={height} rx="12" fill="#f8fafc" />
        <path d={path} fill="none" stroke="#0f67b1" strokeWidth="2" />
        {points.map((point, index) => {
          const x = padding + index * xStep;
          const y = height - padding - ((point.value - min) / range) * (height - padding * 2);
          return <circle key={point.year} cx={x} cy={y} r="3" fill="#0ea5e9" />;
        })}
      </svg>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{points[0]?.year}</span>
        <span>{points[points.length - 1]?.year}</span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>Low: {formatNumber(min, { maximumFractionDigits: 1 })}</span>
        <span>High: {formatNumber(max, { maximumFractionDigits: 1 })}</span>
      </div>
    </div>
  );
}
