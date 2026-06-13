<script lang="ts" setup>
// Renders a plain number (counts, units, percentages) with compact notation and a
// count-up animation. It does NOT divide by any base — for monetary values (stored
// as integer cents) use MKFormatMoney / formatMoney, which divide by 100 and add the
// currency symbol. Passing a money field here would render the raw cents.
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

const counter = useCounterUp(toRef(props, 'value'), {
  decimals: props.maxFractionDigits ?? 0,
});

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
