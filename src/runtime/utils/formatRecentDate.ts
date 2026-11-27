import type { Ref } from 'vue';
import { tryUseNuxtApp } from '#imports';

export interface FormatRecentDateOptions {
  /** BCP 47 locale (`pt-BR`, `pt`). Defaults to the active i18n locale, else the runtime one. */
  locale?: string;
  /** Milliseconds under which the date shows as relative text. Defaults to 24 hours. */
  threshold?: number;
}

const DAY = 24 * 60 * 60 * 1000;

const UNITS = [
  [60 * 60 * 1000, 'hour'],
  [60 * 1000, 'minute'],
  [1000, 'second'],
] as const;

const FULL_DATE: Intl.DateTimeFormatOptions = { day: 'numeric', hour: '2-digit', minute: '2-digit', month: 'short', year: 'numeric' };

function getActiveLocale() { // i18n is optional in the module; outside a component there is no app
  const nuxtApp = tryUseNuxtApp() as { $i18n?: { locale?: Ref<string> } } | null;

  return nuxtApp?.$i18n?.locale?.value;
}

// "há 3 horas" under the threshold, else "27 de nov. de 2026, 00:33"; future dates in full; undefined without a valid date
export function formatRecentDate(date?: Date | string | number | null, options: FormatRecentDateOptions = {}) {
  if (date === undefined || date === null || date === '') return undefined;

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return undefined;

  const locale = options.locale || getActiveLocale();
  const elapsed = Date.now() - value.getTime();

  if (elapsed < 0 || elapsed >= (options.threshold ?? DAY)) {
    return new Intl.DateTimeFormat(locale, FULL_DATE).format(value);
  }

  const [size, unit] = UNITS.find(([size]) => elapsed >= size) ?? UNITS[UNITS.length - 1]!; // under a second: seconds

  return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(-Math.floor(elapsed / size), unit);
}
