interface KPI {
  value: number | string;
  unit: string;
  description: string;
}

interface ShippingKPIGridProps {
  kpis: Record<string, KPI>;
}

const KPI_LABELS: Record<string, string> = {
  fleetTotal: "Fleet total",
  activeFleet: "Active fleet",
  totalTonnage: "Total tonnage",
  crewTotal: "Crew total",
  domesticCrewShare: "Domestic crew share",
  averageFleetAge: "Average fleet age",
  portCalls: "Port calls",
};

const titleCaseFromKey = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function ShippingKPIGrid({ kpis }: ShippingKPIGridProps) {
  const formatValue = (value: number | string) => {
    if (typeof value === "string") return value;
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toFixed(1);
  };

  const kpiList = Object.entries(kpis);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {kpiList.map(([key, kpi]) => (
        <div
          key={key}
          className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
        >
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {KPI_LABELS[key] ?? titleCaseFromKey(key)}
          </div>
          <div className="mb-1 text-3xl font-bold text-slate-800">
            {formatValue(kpi.value)}{" "}
            <span className="text-sm font-semibold text-slate-500">{kpi.unit}</span>
          </div>
          <div className="text-sm text-slate-600">{kpi.description}</div>
        </div>
      ))}
    </div>
  );
}
