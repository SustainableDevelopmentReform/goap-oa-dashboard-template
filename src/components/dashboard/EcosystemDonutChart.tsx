import { arc as d3Arc, pie as d3Pie } from "d3";
import type { PieArcDatum } from "d3";
import { ECOSYSTEM_COLORS, ECOSYSTEM_LABELS, ECOSYSTEM_ORDER } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import type { EcosystemBreakdown, EcosystemKey } from "@/types";

interface EcosystemDonutChartProps {
  ecosystems: EcosystemBreakdown;
  title?: string;
  subtitle?: string;
  className?: string;
}

interface SegmentDatum {
  key: EcosystemKey;
  value: number;
  share: number;
}

const SIZE = 320;
const RADIUS = SIZE / 2;

const pieGenerator = d3Pie<SegmentDatum>()
  .sort(null)
  .value((d) => d.value);

const arcGenerator = d3Arc<PieArcDatum<SegmentDatum>>()
  .innerRadius(RADIUS * 0.55)
  .outerRadius(RADIUS - 8);

export function EcosystemDonutChart({
  ecosystems,
  title,
  subtitle,
  className,
}: EcosystemDonutChartProps) {
  const total = ECOSYSTEM_ORDER.reduce((sum, key) => {
    const value = ecosystems[key];
    return value != null ? sum + value : sum;
  }, 0);

  const segments: SegmentDatum[] = ECOSYSTEM_ORDER.reduce<SegmentDatum[]>((acc, key) => {
    const value = ecosystems[key];
    if (value == null || value <= 0) {
      return acc;
    }
    const share = total > 0 ? (value / total) * 100 : 0;
    acc.push({ key, value, share });
    return acc;
  }, []);

  const arcs = pieGenerator(segments);

  return (
    <figure
      className={`flex flex-col gap-6 rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm ${className ?? ""}`}
    >
      {title ? (
        <header className="space-y-1">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
        </header>
      ) : null}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        <svg
          role="img"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto h-64 w-64"
          aria-label="Distribution of ecosystem extent"
        >
          <g transform={`translate(${RADIUS}, ${RADIUS})`}>
            {arcs.map((arc) => {
              const path = arcGenerator(arc);
              if (!path) {
                return null;
              }
              return (
                <path
                  key={arc.data.key}
                  d={path}
                  fill={ECOSYSTEM_COLORS[arc.data.key]}
                  stroke="white"
                  strokeWidth={2}
                />
              );
            })}
            <circle r={RADIUS * 0.55} fill="white" />
            <text
              textAnchor="middle"
              dy="-0.2em"
              className="fill-slate-900 text-2xl font-semibold"
            >
              {formatNumber(total, { maximumFractionDigits: 0 })}
            </text>
            <text textAnchor="middle" dy="1.2em" className="fill-slate-500 text-sm">
              hectares
            </text>
          </g>
        </svg>
        <dl className="flex flex-1 flex-col gap-3">
          {segments.map((segment) => (
            <div
              key={segment.key}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: ECOSYSTEM_COLORS[segment.key] }}
                  aria-hidden
                />
                <dt className="text-sm font-medium text-slate-700">
                  {ECOSYSTEM_LABELS[segment.key]}
                </dt>
              </div>
              <dd className="text-sm font-semibold text-slate-900">
                {formatNumber(segment.value, { maximumFractionDigits: 0 })} ha
                <span className="ml-2 text-xs font-medium text-slate-500">
                  {segment.share.toFixed(1)}%
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </figure>
  );
}
