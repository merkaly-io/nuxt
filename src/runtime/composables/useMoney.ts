import { computed, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

interface UseMoneyOptions {
  base?: MaybeRefOrGetter<number>;
  currency?: MaybeRefOrGetter<string>;
  locale?: MaybeRefOrGetter<string>;
  mode?: MaybeRefOrGetter<Intl.NumberFormatOptionsStyle>;
}

export function useMoney(value: MaybeRefOrGetter<number>, options: UseMoneyOptions = {}) {
  const price = computed(() => {
    const amount = toValue(value) / toValue(options.base ?? 100);
    const money = amount.toLocaleString(toValue(options.locale ?? 'en-US'), {
      style: toValue(options.mode ?? 'currency'),
      currency: toValue(options.currency ?? 'USD'),
    });

    return {
      currency: money[0],
      value: money.slice(1, -3),
      digits: money.slice(-3),
    };
  });

  return { price };
}
