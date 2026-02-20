import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';
import { formatMoney } from '../utils/formatMoney';

interface UseMoneyOptions {
  base?: MaybeRefOrGetter<number>;
  currency?: MaybeRefOrGetter<string>;
  locale?: MaybeRefOrGetter<string>;
  mode?: MaybeRefOrGetter<Intl.NumberFormatOptionsStyle>;
}

export function useMoney(value: MaybeRefOrGetter<number>, options: UseMoneyOptions = {}) {
  return computed(() => formatMoney(toValue(value), {
    base: toValue(options.base),
    currency: toValue(options.currency),
    locale: toValue(options.locale),
    mode: toValue(options.mode),
  }));
}
