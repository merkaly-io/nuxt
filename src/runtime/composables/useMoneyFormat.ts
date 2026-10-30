import { computed } from 'vue';
import { useRuntimeConfig, useState } from '#imports';
import {
  DEFAULT_MONEY_CURRENCY,
  DEFAULT_MONEY_LOCALE,
  formatMoney,
  formatMoneyParts,
  type FormatMoneyOptions,
} from '../utils/formatMoney';

export interface MoneyDefaults {
  /** ISO 4217 code, e.g. `BRL`. */
  currency?: string;
  /** BCP 47 locale, e.g. `pt-BR` (a bare language such as `pt` also works). */
  locale?: string;
}

const STATE_KEY = 'merkaly:money';

/**
 * App-level money defaults used by `MKFormatMoney` / `MKInputMoney`.
 *
 * Resolution order: component props > `setMoneyDefaults()` (runtime, per app) >
 * `merkaly.money` module option (runtime config) > `USD` / `en-US`.
 */
export const useMoneyFormat = () => {
  const state = useState<MoneyDefaults>(STATE_KEY, () => ({}));
  const config = useRuntimeConfig().public.merkaly as { money?: MoneyDefaults } | undefined;

  const currency = computed(() => state.value.currency || config?.money?.currency || DEFAULT_MONEY_CURRENCY);
  const locale = computed(() => state.value.locale || config?.money?.locale || DEFAULT_MONEY_LOCALE);

  const setMoneyDefaults = (defaults: MoneyDefaults) => {
    state.value = { ...state.value, ...defaults };
  };

  const resetMoneyDefaults = () => {
    state.value = {};
  };

  const resolve = (options: FormatMoneyOptions = {}): FormatMoneyOptions => ({
    ...options,
    currency: options.currency || currency.value,
    locale: options.locale || locale.value,
    symbolCurrency: options.symbolCurrency || currency.value,
  });

  return {
    currency,
    format: (value: number, options?: FormatMoneyOptions) => formatMoney(value, resolve(options)),
    formatParts: (value: number, options?: FormatMoneyOptions) => formatMoneyParts(value, resolve(options)),
    locale,
    resetMoneyDefaults,
    resolve,
    setMoneyDefaults,
  };
};

/** Shortcut for `useMoneyFormat().setMoneyDefaults(defaults)`. */
export const setMoneyDefaults = (defaults: MoneyDefaults) => useMoneyFormat().setMoneyDefaults(defaults);
