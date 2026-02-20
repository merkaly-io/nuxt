export interface FormatMoneyOptions {
  base?: number;
  currency?: string;
  locale?: string;
  mode?: Intl.NumberFormatOptionsStyle;
}

export function formatMoney(value: number, options: FormatMoneyOptions = {}) {
  return (value / (options.base ?? 100)).toLocaleString(options.locale ?? 'en-US', {
    style: options.mode ?? 'currency',
    currency: options.currency ?? 'USD',
  });
}
