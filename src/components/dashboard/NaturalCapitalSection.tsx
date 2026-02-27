import { formatNumber } from "@/lib/format";
import type { NaturalCapitalData } from "@/types";

const CLUSTER_COLORS: Record<string, string> = {
  marine_industry: "#0ea5e9",
  energy_minerals: "#f59e0b",
  fisheries: "#10b981",
  biotechnology: "#6366f1",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  fish: "🐟",
  crustaceans: "🦀",
  molluscs: "🐚",
  seaweed: "🪸",
  other_aquatic_biota: "🐠",
  garam: "🧂",
  sand_stone_building_materials: "🧱",
  seawater: "💧",
  new_renewable_energy: "⚡️",
  mangrove_wood: "🌳",
  ecosystem_services: "🌊",
  others: "🧭",
};

interface NaturalCapitalSectionProps {
  naturalCapital?: NaturalCapitalData;
}

export function NaturalCapitalSection({ naturalCapital }: NaturalCapitalSectionProps) {
  if (!naturalCapital) {
    return null;
  }

  const clusters = naturalCapital.clusters;

  return (
    <section className="rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="space-y-2 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Natural capital provision & use
        </p>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-slate-900">
            Marine natural inputs powering the blue economy
          </h2>
          <p className="text-sm text-slate-600">
            Provision volumes and physical use by marine industry clusters, {naturalCapital.year}.
            Values are presented in their native units.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {naturalCapital.categories.map((category) => {
          const emoji = CATEGORY_EMOJIS[category.id] ?? "🌊";
          const provisionLabel = `${formatNumber(category.provision, {
            maximumFractionDigits: category.provision < 10 ? 1 : 0,
          })} ${category.unit}`;
          return (
            <article
              key={category.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/85 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {emoji}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{category.label}</h3>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Provision: {provisionLabel}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-primary-soft/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
                  {naturalCapital.year}
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(category.usage).map(([clusterId, value]) => {
                  const label = clusters[clusterId] ?? clusterId;
                  const share =
                    category.provision > 0 ? Math.min((value / category.provision) * 100, 120) : 0;
                  return (
                    <div key={clusterId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                        <span>{label}</span>
                        <span className="text-slate-500">
                          {formatNumber(value, { maximumFractionDigits: value < 10 ? 1 : 0 })}{" "}
                          {category.unit}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(share, 3)}%`,
                            backgroundColor: CLUSTER_COLORS[clusterId] ?? "#0ea5e9",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>

      {naturalCapital.metadata?.dataSource ? (
        <footer className="mt-6 rounded-2xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Source</p>
          <p>{naturalCapital.metadata.dataSource}</p>
          {naturalCapital.metadata.notes ? (
            <p className="mt-1 text-slate-400">{naturalCapital.metadata.notes}</p>
          ) : null}
        </footer>
      ) : null}
    </section>
  );
}
