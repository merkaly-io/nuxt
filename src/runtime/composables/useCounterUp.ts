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
  const { duration = 0.8, decimals = 0, ease = 'power2.out' } = options;

  const counter = reactive({
    value: toValue(target) || 0,
  });

  let tween: gsap.core.Tween | undefined;
  let initialized = false;

  watchImmediate(
    () => toValue(target),
    (value) => {
      const nextValue = Number(value) || 0;

      if (!initialized) {
        counter.value = nextValue;
        initialized = true;
        return;
      }

      tween?.kill();

      tween = gsap.to(counter, {
        value: nextValue,
        duration,
        ease,
      });
    },
  );

  onBeforeUnmount(() => tween?.kill());

  return computed(() => Number(counter.value.toFixed(decimals)));
}
