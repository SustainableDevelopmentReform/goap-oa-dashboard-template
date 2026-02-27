const DEFAULT_LOCALE = "en-US";

export const formatNumber = (
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {},
  locale = DEFAULT_LOCALE,
): string => {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, options).format(value);
};

export const formatHectares = (value: number | null | undefined): string =>
  formatNumber(value, { maximumFractionDigits: 0 }) + " ha";

export const formatPercentage = (
  value: number | null | undefined,
  maximumFractionDigits = 1,
): string => {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return `${formatNumber(value, {
    style: "percent",
    maximumFractionDigits,
    minimumFractionDigits: Math.min(1, maximumFractionDigits),
  })}`;
};

export const formatCurrency = (
  value: number | null | undefined,
  currency = "USD",
): string => {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }

  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};
