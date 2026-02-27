import type {
  EcosystemServiceGroup,
  EcosystemServiceMetric,
  EcosystemServiceValue,
} from "@/types";

const sortMetricValues = (metric: EcosystemServiceMetric): EcosystemServiceValue[] =>
  [...metric.values].sort((a, b) => b.year - a.year);

export const getLatestMetricValue = (
  metric: EcosystemServiceMetric | null | undefined,
): EcosystemServiceValue | null => {
  if (!metric) {
    return null;
  }
  const [latest] = sortMetricValues(metric);
  return latest ?? null;
};

export const getPreviousMetricValue = (
  metric: EcosystemServiceMetric | null | undefined,
): EcosystemServiceValue | null => {
  if (!metric) {
    return null;
  }
  const [, previous] = sortMetricValues(metric);
  return previous ?? null;
};

export const findMetricById = (
  metrics: EcosystemServiceMetric[] | null | undefined,
  id: string,
): EcosystemServiceMetric | null => {
  if (!metrics) {
    return null;
  }
  return metrics.find((metric) => metric.id === id) ?? null;
};

export const getMaxMetricYear = (
  metrics: EcosystemServiceMetric[] | null | undefined,
): number | null => {
  if (!metrics) {
    return null;
  }
  let maxYear: number | null = null;
  metrics.forEach((metric) => {
    metric.values.forEach(({ year }) => {
      if (maxYear == null || year > maxYear) {
        maxYear = year;
      }
    });
  });
  return maxYear;
};

export const normalizeServiceGroups = (
  groups: EcosystemServiceGroup[] | null | undefined,
): EcosystemServiceGroup[] => {
  if (!groups) {
    return [];
  }
  return [...groups].sort((a, b) => a.ecosystemLabel.localeCompare(b.ecosystemLabel));
};

export const reorderMetrics = (
  metrics: EcosystemServiceMetric[] | null | undefined,
): EcosystemServiceMetric[] => {
  if (!metrics) {
    return [];
  }
  return [...metrics].sort((a, b) => {
    if (a.id === "area" && b.id !== "area") return -1;
    if (b.id === "area" && a.id !== "area") return 1;
    return a.label.localeCompare(b.label);
  });
};
