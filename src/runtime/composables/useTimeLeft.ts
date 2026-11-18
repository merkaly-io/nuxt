import { useIntervalFn, useNow } from '@vueuse/core';
import type { MaybeRefOrGetter } from 'vue';
import { computed, toValue } from 'vue';
import { formatTimeLeft } from '../utils/formatTimeLeft';

// Countdown to a date, ticking every second: seconds left (0 once passed) and the text ("4h 2min"); undefined without a date
export function useTimeLeft(target: MaybeRefOrGetter<Date | string | null | undefined>) {
  const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 1000) });

  const seconds = computed(() => {
    const date = toValue(target);

    if (!date) return undefined;

    return Math.max(0, Math.floor((new Date(date).getTime() - now.value.getTime()) / 1000));
  });

  const text = computed(() => (seconds.value === undefined ? undefined : formatTimeLeft(seconds.value)));

  return { seconds, text };
}
