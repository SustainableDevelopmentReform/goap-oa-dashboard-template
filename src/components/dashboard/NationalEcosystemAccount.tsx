import { EcosystemConditionCard } from "@/components/dashboard/EcosystemConditionCard";
import { EcosystemDonutChart } from "@/components/dashboard/EcosystemDonutChart";
import { sumEcosystemAreas } from "@/lib/calculations";
import { formatNumber } from "@/lib/format";
import type { NationalData } from "@/types";

const FEATURED_ECOSYSTEMS = ["coralReef", "reefFlats", "seagrass", "mangroves"] as const;

interface NationalEcosystemAccountProps {
  national: NationalData;
}

export function NationalEcosystemAccount({ national }: NationalEcosystemAccountProps) {
  const total = sumEcosystemAreas(national.ecosystems);

  return (
    <section className="flex flex-col gap-8 rounded-[1.5rem] border border-slate-200/70 bg-white/80 p-6 shadow-sm">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          National Ecosystem Extent Account
        </p>
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-semibold text-slate-900">Ocean Ecosystem Extent</h2>
          <p className="text-sm text-slate-600">
            Total mapped extent: {formatNumber(total, { maximumFractionDigits: 0 })} hectares across
            key marine ecosystems.
          </p>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <EcosystemDonutChart
          ecosystems={national.ecosystems}
          subtitle="National distribution across ecosystem classes"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURED_ECOSYSTEMS.map((ecosystem) => (
            <EcosystemConditionCard
              key={ecosystem}
              ecosystem={ecosystem}
              extent={national.ecosystems[ecosystem]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
