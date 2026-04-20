export const formatCurrency = (
  value: number,
  options: {
    currency?: string;
    locale?: string;
    showSign?: boolean;
  } = {}
): string => {
  const { currency = "INR", locale = "en-IN", showSign = false } = options;

  if (typeof value !== "number" || isNaN(value)) return "₹0";

  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  if (!showSign) return formatted;

  return value >= 0 ? `+${formatted}` : `-${formatted}`;
};