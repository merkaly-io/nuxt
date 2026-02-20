import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';
import { formatMoney } from '../utils/formatMoney';
import type { FormatMoneyOptions } from '../utils/formatMoney';

type UseMoneyOptions = { [K in keyof FormatMoneyOptions]: MaybeRefOrGetter<FormatMoneyOptions[K]> };

export function useMoney(value: MaybeRefOrGetter<number>, options: Partial<UseMoneyOptions> = {}) {
  return computed(() => formatMoney(toValue(value), {
    base: toValue(options.base),
    currency: toValue(options.currency),
    locale: toValue(options.locale),
    mode: toValue(options.mode),
  }));
}
