"use client";

interface IndicatorIconScaleProps {
  icon: string;
  iconCount: number;
  label: string;
  value: number;
  unit: string;
  tier: "low" | "moderate" | "high";
}

const tierColors = {
  low: "text-blue-500",
  moderate: "text-yellow-500",
  high: "text-red-500",
};

const tierBgColors = {
  low: "bg-blue-50",
  moderate: "bg-yellow-50",
  high: "bg-red-50",
};

const iconMap: Record<string, string> = {
  population: "👥",
  youth: "👶",
  tourism: "✈️",
  boat: "⛵",
  meal: "🍽️",
  wave: "🌊",
  currency: "💵",
  damage: "⚠️",
};

export function IndicatorIconScale({
  icon,
  iconCount,
  label,
  value,
  unit,
  tier,
}: IndicatorIconScaleProps) {
  const iconEmoji = iconMap[icon] || "📊";
  const icons = Array(iconCount).fill(iconEmoji).join("");

  return (
    <div className={`rounded-lg p-4 ${tierBgColors[tier]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-slate-700 text-sm">{label}</h4>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${tierColors[tier]}`}>
          {tier.charAt(0).toUpperCase() + tier.slice(1)}
        </span>
      </div>

      <div className="text-2xl mb-2">{icons}</div>

      <div className="text-xs text-slate-600">
        {value} {unit}
      </div>
    </div>
  );
}
