import { memo } from "react";
import { arc as d3Arc, pie as d3Pie } from "d3";
import type { PieArcDatum } from "d3";
import { ECOSYSTEM_COLORS, ECOSYSTEM_LABELS, ECOSYSTEM_ORDER } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import type { EcosystemBreakdown, EcosystemKey } from "@/types";

interface MiniEcosystemDonutProps {
  ecosystems: EcosystemBreakdown;
}

interface SegmentDatum {
  key: EcosystemKey;
  value: number;
  share: number;
}

const SIZE = 160;
const RADIUS = SIZE / 2;

const pieGenerator = d3Pie<SegmentDatum>()
  .sort(null)
  .value((d) => d.value);

const arcGenerator = d3Arc<PieArcDatum<SegmentDatum>>()
  .innerRadius(RADIUS * 0.58)
  .outerRadius(RADIUS - 6);

export const MiniEcosystemDonut = memo(({ ecosystems }: MiniEcosystemDonutProps) => {
  const total = ECOSYSTEM_ORDER.reduce((sum, key) => {
    const value = ecosystems[key];
    return value != null ? sum + value : sum;
  }, 0);

  const segments: SegmentDatum[] = ECOSYSTEM_ORDER.reduce<SegmentDatum[]>(
    (acc, key) => {
      const value = ecosystems[key];
      if (value == null || value <= 0) {
        return acc;
      }
      const share = total > 0 ? (value / total) * 100 : 0;
      acc.push({ key, value, share });
      return acc;
    },
    [],
  );

  const arcs = pieGenerator(segments);

  return (
    <figure className="flex flex-col items-center gap-3">
      <svg
        role="img"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="h-36 w-36"
        aria-label="Ecosystem extent preview"
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
                strokeWidth={1.5}
              />
            );
          })}
          <circle r={RADIUS * 0.6} fill="white" />
          <text
            textAnchor="middle"
            dy="-0.1em"
            className="fill-slate-900 text-lg font-semibold"
          >
            {formatNumber(total, { maximumFractionDigits: 0 })}
          </text>
          <text textAnchor="middle" dy="1.1em" className="fill-slate-500 text-[11px]">
            ha
          </text>
        </g>
      </svg>
      <dl className="grid w-full gap-1 text-[11px] text-slate-600">
        {segments.slice(0, 3).map((segment) => (
          <div key={segment.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: ECOSYSTEM_COLORS[segment.key] }}
                aria-hidden
              />
              <dt>{ECOSYSTEM_LABELS[segment.key]}</dt>
            </div>
            <dd className="font-semibold text-slate-800">
              {segment.share.toFixed(0)}%
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
});

MiniEcosystemDonut.displayName = "MiniEcosystemDonut";
