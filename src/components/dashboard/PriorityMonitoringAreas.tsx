import Link from "next/link";
import { useMemo } from "react";
import { ECOSYSTEM_LABELS } from "@/lib/constants";
import { sumEcosystemAreas } from "@/lib/calculations";
import { formatNumber } from "@/lib/format";
import { buildLocationAreaIndex } from "@/lib/spatialUtils";
import type {
  SpatialConfig,
  SpatialLocation,
  SubnationalArea,
  SubnationalData,
} from "@/types";

interface PriorityMonitoringAreasProps {
  subnational: SubnationalData;
  spatial: SpatialConfig;
}

interface MonitoringEntry {
  location: SpatialLocation;
  area: SubnationalArea | null;
  areaId: string | null;
  stats: PlaceholderStat[];
}

interface PlaceholderStat {
  label: string;
  value: string;
}

const PLACEHOLDER_STATS: PlaceholderStat[][] = [
  [
    { label: "Coral cover (5yr trend)", value: "+1.2% / yr" },
    { label: "Water quality index", value: "74 / 100" },
    { label: "Survey cadence", value: "Quarterly" },
  ],
  [
    { label: "Seagrass vitality", value: "Moderate (68%)" },
    { label: "Benthic surveys", value: "Completed 2024" },
    { label: "Community monitoring", value: "Active" },
  ],
  [
    { label: "Mangrove condition", value: "Improving" },
    { label: "Latest field mission", value: "Jan 2025" },
    { label: "Monitoring focus", value: "Nursery habitats" },
  ],
];

const formatType = (value: string) =>
  value
    .split(/[\s-_]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

export function PriorityMonitoringAreas({
  subnational,
  spatial,
}: PriorityMonitoringAreasProps) {
  const entries = useMemo<MonitoringEntry[]>(() => {
    const areaById = new Map(subnational.areas.map((area) => [area.id, area]));
    const collection = spatial.boundaries.subnational;
    const { locationIdToAreaId } = buildLocationAreaIndex(
      spatial.locations,
      collection,
    );

    return spatial.locations.map((location, index) => {
      const areaId = locationIdToAreaId.get(location.id) ?? null;
      const area = areaId ? areaById.get(areaId) ?? null : null;

      return {
        location,
        area,
        areaId,
        stats: PLACEHOLDER_STATS[index % PLACEHOLDER_STATS.length],
      };
    });
  }, [spatial, subnational.areas]);

  return (
    <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="flex flex-col gap-2 pb-4">
        <h2 className="text-2xl font-semibold text-slate-900">
          Priority monitoring areas
        </h2>
        <p className="text-sm text-slate-600">
          Focal sites for ongoing ecological monitoring and adaptive management.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map(({ area, areaId, location, stats }) => {
          const totalExtent = area ? sumEcosystemAreas(area.ecosystems) : null;
          const typeLabel = formatType(location.type);

          return (
            <article
              key={location.id}
              id={`monitoring-${location.id}`}
              className="flex h-full flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {location.name}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    {typeLabel}
                  </p>
                </div>
                {totalExtent != null ? (
                  <span className="rounded-full border border-primary/30 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary shadow-sm">
                    {formatNumber(totalExtent, { maximumFractionDigits: 0 })} ha
                  </span>
                ) : null}
              </div>
              {area ? (
                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                  {Object.entries(area.ecosystems).map(([key, value]) => {
                    if (value == null) {
                      return null;
                    }
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span>
                          {ECOSYSTEM_LABELS[key as keyof typeof ECOSYSTEM_LABELS]}
                        </span>
                        <span>{formatNumber(value, { maximumFractionDigits: 0 })} ha</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-500">
                  Link this monitoring site to a mapped sub-national area to surface
                  ecosystem extent statistics.
                </div>
              )}
              {location.description || area?.description ? (
                <p className="text-sm leading-relaxed text-slate-500">
                  {location.description ?? area?.description}
                </p>
              ) : null}
              <dl className="grid gap-2 rounded-2xl border border-slate-200 bg-white/85 p-3 text-sm text-slate-700">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between gap-3">
                    <dt className="font-medium text-slate-500">{stat.label}</dt>
                    <dd className="font-semibold text-slate-900">{stat.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold text-primary">
                {areaId ? (
                  <Link
                    href={`/spatial?area=${areaId}`}
                    className="rounded-full bg-primary-soft/60 px-3 py-1 hover:bg-primary-soft"
                  >
                    View in spatial explorer
                  </Link>
                ) : (
                  <Link
                    href="/spatial"
                    className="rounded-full bg-primary-soft/60 px-3 py-1 hover:bg-primary-soft"
                  >
                    View in spatial explorer
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
