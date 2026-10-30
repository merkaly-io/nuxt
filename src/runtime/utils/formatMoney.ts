export const DEFAULT_MONEY_CURRENCY = 'USD';
export const DEFAULT_MONEY_LOCALE = 'en-US';

export interface FormatMoneyOptions {
  base?: number;
  /**
   * ISO 4217 code (`BRL`, `USD`, ...). For backward compatibility a plain symbol
   * (`$`, `R$`) is also accepted: the number is formatted with `symbolCurrency`
   * (or USD) and the symbol replaces the currency sign.
   */
  currency?: string;
  locale?: string;
  mode?: Intl.NumberFormatOptionsStyle;
  notation?: Intl.NumberFormatOptions['notation'];
  maximumFractionDigits?: number;
  /** Currency used for the number layout when `currency` is a symbol. */
  symbolCurrency?: string;
}

export interface FormatMoneyParts {
  /** Everything before the integer part (sign, currency symbol, spacing). */
  prefix: string;
  /** Integer part with grouping separators. */
  amount: string;
  /** Decimal separator plus fraction digits (empty when there are none). */
  digits: string;
  /** Everything after the fraction (suffix currency symbols, compact units). */
  suffix: string;
}

const CURRENCY_CODE = /^[A-Z]{3}$/i;

export function isCurrencyCode(value?: string): value is string {
  return Boolean(value && CURRENCY_CODE.test(value));
}

function toFormatter(options: FormatMoneyOptions) {
  const symbol = isCurrencyCode(options.currency) ? undefined : options.currency;
  const currency = symbol
    ? (isCurrencyCode(options.symbolCurrency) ? options.symbolCurrency : DEFAULT_MONEY_CURRENCY)
    : (options.currency ?? DEFAULT_MONEY_CURRENCY);

  const formatter = new Intl.NumberFormat(options.locale || DEFAULT_MONEY_LOCALE, {
    currency: currency.toUpperCase(),
    maximumFractionDigits: options.maximumFractionDigits,
    notation: options.notation,
    style: options.mode ?? 'currency',
  });

  return { formatter, symbol };
}

/**
 * Splits a monetary value held as integer cents into display parts using
 * `Intl.NumberFormat#formatToParts`, so multi-character symbols (`R$`) and
 * locale separators (`249,69`) are preserved.
 */
export function formatMoneyParts(value: number, options: FormatMoneyOptions = {}): FormatMoneyParts {
  const { formatter, symbol } = toFormatter(options);
  const parts = formatter
    .formatToParts(value / (options.base ?? 100))
    .map(part => (symbol && part.type === 'currency' ? { ...part, value: symbol } : part));

  const result: FormatMoneyParts = { prefix: '', amount: '', digits: '', suffix: '' };
  const firstNumeric = parts.findIndex(part => part.type === 'integer');
  let lastNumeric = -1;

  parts.forEach((part, index) => {
    if (['integer', 'group', 'decimal', 'fraction'].includes(part.type)) {
      lastNumeric = index;
    }
  });

  parts.forEach((part, index) => {
    if (firstNumeric === -1 || index < firstNumeric) {
      result.prefix += part.value;
    } else if (index > lastNumeric) {
      result.suffix += part.value;
    } else if (part.type === 'decimal' || part.type === 'fraction') {
      result.digits += part.value;
    } else {
      result.amount += part.value;
    }
  });

  return result;
}

/**
 * Formats a monetary value held as an **integer in the minor unit (cents)**.
 *
 * Across Merkaly money is stored and transported as integer cents ($1.00 -> 100),
 * so this helper divides by `base` (default 100) before formatting. Pass cents in,
 * get a currency string out: `formatMoney(100)` -> `"$1.00"`,
 * `formatMoney(24969, { currency: 'BRL', locale: 'pt-BR' })` -> `"R$ 249,69"`.
 *
 * This helper is pure (no app defaults). Inside components prefer
 * `useMoneyFormat().format()`, which applies the app-level currency/locale.
 *
 * For non-currency numbers (counts, units, percentages) use `formatNumber` /
 * `MKFormatNumber` instead, those do NOT divide and would show the raw cents.
 */
export function formatMoney(value: number, options: FormatMoneyOptions = {}) {
  const parts = formatMoneyParts(value, options);

  return parts.prefix + parts.amount + parts.digits + parts.suffix;
}
