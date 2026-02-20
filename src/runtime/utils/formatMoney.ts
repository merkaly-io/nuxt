interface FormatMoneyOptions {
  base?: number;
  currency?: string;
  locale?: string;
  mode?: Intl.NumberFormatOptionsStyle;
}

export function formatMoney(value: number, options: FormatMoneyOptions = {}) {
  const money = (value / (options.base ?? 100)).toLocaleString(options.locale ?? 'en-US', {
    style: options.mode ?? 'currency',
    currency: options.currency ?? 'USD',
  });

  return {
    amount: money.slice(1, -3),
    currency: money[0],
    digits: money.slice(-3),
    formatted: money,
  };
}
