<script lang="ts" setup>
import type { PropType } from 'vue';
import { computed } from 'vue';

const props = defineProps({
  base: { type: Number, default: 1_00 },
  currency: { type: String, default: () => 'USD' },
  hideDecimal: { type: Boolean, default: () => false },
  locale: { type: String, default: () => 'en-US' },
  mode: { type: String as PropType<Intl.NumberFormatOptionsStyle>, default: 'currency' },
  tag: { type: String, default: 'span' },
  value: { type: Number, default: 0 },
});

const price = computed(() => {
  const price = props.value / props.base;
  const money = price.toLocaleString(props.locale, {
    style: props.mode,
    currency: props.currency,
  });

  return {
    currency: money[0],
    value: money.slice(1, -3),
    digits: money.slice(-3),
  };
});
</script>

<template>
  <component :is="tag" class="format-money">
    <span class="currency" v-text="price.currency" />
    <span class="value" v-text="price.value" />
    <sup v-if="!props.hideDecimal" class="digits" v-text="price.digits" />
  </component>
</template>

<style lang="scss" scoped>
.format-money {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
</style>
