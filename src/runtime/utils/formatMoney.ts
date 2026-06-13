export interface FormatMoneyOptions {
  base?: number;
  currency?: string;
  locale?: string;
  mode?: Intl.NumberFormatOptionsStyle;
  notation?: Intl.NumberFormatOptions['notation'];
  maximumFractionDigits?: number;
}

/**
 * Formats a monetary value held as an **integer in the minor unit (cents)**.
 *
 * Across Merkaly money is stored and transported as integer cents ($1.00 -> 100),
 * so this helper divides by `base` (default 100) before formatting. Pass cents in,
 * get a currency string out: `formatMoney(100)` -> `"$1.00"`.
 *
 * For non-currency numbers (counts, units, percentages) use `formatNumber` /
 * `MKFormatNumber` instead — those do NOT divide and would show the raw cents.
 */
export function formatMoney(value: number, options: FormatMoneyOptions = {}) {
  return (value / (options.base ?? 100)).toLocaleString(options.locale ?? 'en-US', {
    style: options.mode ?? 'currency',
    currency: options.currency ?? 'USD',
    notation: options.notation,
    maximumFractionDigits: options.maximumFractionDigits,
  });
}
