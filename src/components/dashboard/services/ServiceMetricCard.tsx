import { getLatestMetricValue, getPreviousMetricValue } from "@/lib/services";
import { formatNumber } from "@/lib/format";
import type { EcosystemServiceMetric } from "@/types";

interface ServiceMetricCardProps {
  metric: EcosystemServiceMetric;
  variant?: "default" | "compact";
  showChange?: boolean;
}

export function ServiceMetricCard({
  metric,
  variant = "default",
  showChange = true,
}: ServiceMetricCardProps) {
  const latest = getLatestMetricValue(metric);
  const previous = getPreviousMetricValue(metric);
  const isExtent = metric.id === "area";
  const unit = isExtent ? "ha" : metric.unit;
  const multiplier = isExtent ? 1000 : 1;
  const latestValue = latest ? latest.value * multiplier : null;
  const previousValue = previous ? previous.value * multiplier : null;
  const change = latestValue != null && previousValue != null ? latestValue - previousValue : null;
  const maxFractionDigits = latestValue != null && latestValue < 10 ? 1 : 0;
  const previousFractionDigits =
    previousValue != null && previousValue < 10 ? 1 : 0;
  const valueLabel = latestValue != null
    ? `${formatNumber(latestValue, { maximumFractionDigits: maxFractionDigits })} ${unit}`
    : "Data not available";
  const label = isExtent ? "Extent" : metric.label;

  const baseClasses =
    "flex flex-col gap-2 rounded-xl border border-slate-100 bg-white/90 shadow-sm";
  const compactClasses = variant === "compact" ? "p-3 text-sm" : "p-4";

  return (
    <article className={`${baseClasses} ${compactClasses}`}>
      <header className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </p>
        {latest ? (
          <span className="text-[11px] font-semibold text-primary/80">{latest.year}</span>
        ) : null}
      </header>
      <p className="text-xl font-semibold text-slate-900">{valueLabel}</p>
      {showChange && previous ? (
        <p className="text-xs text-slate-500">
          {previous.year}:{" "}
          {formatNumber(previous.value, { maximumFractionDigits: previousFractionDigits })}{" "}
          {metric.unit}
          {change != null ? (
            <span className={`ml-2 font-semibold ${change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {change >= 0 ? "+" : ""}
              {formatNumber(change, { maximumFractionDigits: maxFractionDigits })} {metric.unit}
            </span>
          ) : null}
        </p>
      ) : null}
    </article>
  );
}
