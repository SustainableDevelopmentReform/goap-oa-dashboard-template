import type {
  EconomicData,
  EconomicIndicator,
  EconomicIndicatorsMap,
  EcosystemBreakdown,
  EcosystemKey,
  SubnationalArea,
  TimeSeriesData,
} from "@/types";
import { ECOSYSTEM_ORDER } from "./constants";

export const sumEcosystemAreas = (ecosystems: EcosystemBreakdown): number =>
  ECOSYSTEM_ORDER.reduce((total, key) => {
    const value = ecosystems[key];
    return value != null ? total + value : total;
  }, 0);

export const calculateEcosystemShares = (
  ecosystems: EcosystemBreakdown,
): Record<EcosystemKey, number> => {
  const total = sumEcosystemAreas(ecosystems);

  if (total === 0) {
    return ECOSYSTEM_ORDER.reduce<Record<EcosystemKey, number>>((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<EcosystemKey, number>);
  }

  return ECOSYSTEM_ORDER.reduce<Record<EcosystemKey, number>>((acc, key) => {
    const value = ecosystems[key];
    acc[key] = value != null ? (value / total) * 100 : 0;
    return acc;
  }, {} as Record<EcosystemKey, number>);
};

export const getTopSubnationalAreas = (
  areas: SubnationalArea[],
  limit = 3,
): SubnationalArea[] => {
  return [...areas]
    .sort((a, b) => sumEcosystemAreas(b.ecosystems) - sumEcosystemAreas(a.ecosystems))
    .slice(0, limit);
};

export const getDominantEcosystem = (
  ecosystems: EcosystemBreakdown,
): { key: EcosystemKey; value: number } | null => {
  let maxKey: EcosystemKey | null = null;
  let maxValue = Number.NEGATIVE_INFINITY;

  for (const key of ECOSYSTEM_ORDER) {
    const value = ecosystems[key];
    if (value != null && value > maxValue) {
      maxKey = key;
      maxValue = value;
    }
  }

  if (maxKey == null) {
    return null;
  }

  return { key: maxKey, value: maxValue };
};

export const sortIndicators = (
  indicators: EconomicIndicatorsMap,
): [string, EconomicIndicator][] =>
  Object.entries(indicators).sort(([a], [b]) => a.localeCompare(b));

export const getEconomicTotals = (data: EconomicData) => {
  const total = data.sectors.reduce((acc, sector) => acc + sector.value, 0);
  return { total, currency: data.currency };
};

export const findSeriesByName = (data: TimeSeriesData, name: string) =>
  data.ecosystems.find((series) => series.name === name || series.displayName === name);

export const getLatestSeriesValue = (seriesName: string, data: TimeSeriesData) => {
  const series = findSeriesByName(data, seriesName);
  if (!series) {
    return null;
  }
  const sorted = [...series.data].sort((a, b) => b.year - a.year);
  return sorted[0] ?? null;
};
