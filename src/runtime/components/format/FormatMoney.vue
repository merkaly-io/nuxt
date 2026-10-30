<script lang="ts" setup>
import type { PropType } from 'vue';
import { computed } from 'vue';
import { useMoneyFormat } from '../../composables/useMoneyFormat';

const props = defineProps({
  base: { type: Number, default: 1_00 },
  /** ISO 4217 code (`BRL`) or, for backward compatibility, a symbol (`$`). Falls back to the app default. */
  currency: { type: String, default: undefined },
  hideDecimal: { type: Boolean, default: () => false },
  /** BCP 47 locale (`pt-BR`). Falls back to the app default. */
  locale: { type: String, default: undefined },
  mode: { type: String as PropType<Intl.NumberFormatOptionsStyle>, default: 'currency' },
  tag: { type: String, default: 'span' },
  value: { type: Number, default: 0 },
});

const { formatParts } = useMoneyFormat();

const price = computed(() => formatParts(props.value, {
  base: props.base,
  currency: props.currency,
  locale: props.locale,
  mode: props.mode,
}));
</script>

<template>
  <component :is="props.tag" class="format-money">
    <span v-if="price.prefix" class="currency" v-text="price.prefix" />
    <span class="value" v-text="price.amount" />
    <sup v-if="!props.hideDecimal && price.digits" class="digits" v-text="price.digits" />
    <span v-if="price.suffix" class="currency" v-text="price.suffix" />
  </component>
</template>

<style lang="scss" scoped>
.format-money {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
</style>
