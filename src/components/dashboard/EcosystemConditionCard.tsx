import { ECOSYSTEM_COLORS, ECOSYSTEM_LABELS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import type { EcosystemKey } from "@/types";

interface EcosystemConditionCardProps {
  ecosystem: EcosystemKey;
  extent: number | null | undefined;
  conditionLabel?: string | null;
}

const DEFAULT_CONDITION_LABELS: Partial<Record<EcosystemKey, string>> = {
  coralReef: "Condition: XX% live coral cover",
  reefFlats: "Condition: XX water quality rating",
  seagrass: "Condition: XX% cover and X species diversity",
  mangroves: "Condition: XX% average canopy cover",
};

export function EcosystemConditionCard({
  ecosystem,
  extent,
  conditionLabel,
}: EcosystemConditionCardProps) {
  const label = ECOSYSTEM_LABELS[ecosystem];
  const value =
    extent != null ? `${formatNumber(extent, { maximumFractionDigits: 0 })} ha` : "Data not available";
  const condition =
    conditionLabel ?? DEFAULT_CONDITION_LABELS[ecosystem] ?? "Condition indicator coming soon";

  return (
    <article className="flex min-h-[180px] flex-col gap-4 rounded-2xl border border-slate-100 bg-white/90 p-5 shadow-sm">
      <header className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: ECOSYSTEM_COLORS[ecosystem] }}
          aria-hidden
        />
        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </h4>
      </header>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{condition}</p>
    </article>
  );
}
