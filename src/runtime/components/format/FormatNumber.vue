<script lang="ts" setup>
import type { PropType } from 'vue';
import { computed, toRef } from 'vue';
import { useCounterUp } from '../../composables/useCounterUp';

const props = defineProps({
  currency: { type: String, default: () => 'USD' },
  tag: { type: String, default: 'span' },
  value: { type: Number, default: 0 },
  type: { type: String as PropType<Intl.NumberFormatOptions['style']>, default: undefined },
  maxFractionDigits: {
    type: Number as PropType<Intl.NumberFormatOptions['maximumFractionDigits']>,
    default: undefined,
  },
});

const counter = useCounterUp(toRef(props, 'value'));

const number = computed(() =>
  Intl.NumberFormat('en-US', {
    currency: props.currency,
    maximumFractionDigits: props.maxFractionDigits,
    notation: 'compact',
    style: props.type,
  }).format(counter.value),
);
</script>

<template>
  <component :is="tag" class="format-number">
    <span v-text="number" />
  </component>
</template>

<style lang="scss" scoped>
.format-number {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
</style>
