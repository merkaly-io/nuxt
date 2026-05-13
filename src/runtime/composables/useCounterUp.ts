import { watchImmediate } from '@vueuse/core';
import gsap from 'gsap';
import type { MaybeRefOrGetter } from 'vue';
import { computed, onBeforeUnmount, reactive, toValue } from 'vue';

type UseCounterUpOptions = {
  duration?: number;
  decimals?: number;
  ease?: string;
};

export function useCounterUp(target: MaybeRefOrGetter<number>, options: UseCounterUpOptions = {}) {
  const { duration = 1, ease = 'power2.out' } = options;
  const counter = reactive({ value: 0 });

  let tween: gsap.core.Tween | undefined;

  watchImmediate(() => toValue(target), (value) => {
      tween?.kill();

      tween = gsap.to(counter, { value, duration, ease });
    },
  );

  onBeforeUnmount(() => tween?.kill());

  return computed(() => counter.value);
}
