export const formatPercentage = (
  value: number,
  options: {
    decimalPlaces?: number;
    showSign?: boolean;
    isExpense?: boolean;
  } = {}
): string => {
  const { decimalPlaces = 1, showSign = false, isExpense = false } = options;

  if (typeof value !== "number" || isNaN(value)) return "0%";

  const formatted = new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Math.abs(value) / 100);

  if (!showSign) return formatted;

  if (!isExpense) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  }

  return value <= 0 ? `+${formatted}` : `-${formatted}`;
};