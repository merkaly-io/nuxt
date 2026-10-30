<script lang="ts" setup>
import type { Numberish } from 'bootstrap-vue-next/dist/src/types/CommonTypes';
import { computed } from 'vue';
import { Money3Component } from 'v-money3';
import { useMoneyFormat } from '../../composables/useMoneyFormat';
import { isCurrencyCode } from '../../utils/formatMoney';

const money = defineModel<Numberish>({
  default: () => 0,
  get: v => v / 100,
  set: v => Math.trunc(v * 100),
  type: [String, Number],
});

// `decimal`, `placeholder`, `prefix` and `thousands` default to the resolved
// currency/locale (props > setMoneyDefaults() > merkaly.money > USD/en-US).
// Passing them explicitly keeps the previous behaviour.
const props = defineProps({
  /** ISO 4217 code (`BRL`). Falls back to the app default. */
  currency: { type: String, default: undefined },
  decimal: { type: String, default: undefined },
  /** BCP 47 locale (`pt-BR`). Falls back to the app default. */
  locale: { type: String, default: undefined },
  max: { type: Number, required: false, default: undefined },
  min: { type: Number, default: () => 0 },
  placeholder: { type: String, default: undefined },
  precision: { type: Number, default: () => 2 },
  prefix: { type: String, default: undefined },
  suffix: { type: String, default: () => ' ' },
  thousands: { type: String, default: undefined },
});

const { resolve, formatParts } = useMoneyFormat();

const separators = computed(() => {
  const options = resolve({ currency: props.currency, locale: props.locale });
  const code = isCurrencyCode(options.currency) ? options.currency!.toUpperCase() : options.symbolCurrency!;
  const parts = new Intl.NumberFormat(options.locale, { style: 'currency', currency: code }).formatToParts(1234567.89);

  return {
    decimal: parts.find(part => part.type === 'decimal')?.value ?? '.',
    symbol: isCurrencyCode(options.currency)
      ? (parts.find(part => part.type === 'currency')?.value ?? options.currency!)
      : options.currency!,
    thousands: parts.find(part => part.type === 'group')?.value ?? ',',
  };
});

const placeholder = computed(() => {
  if (props.placeholder !== undefined) {
    return props.placeholder;
  }

  const parts = formatParts(0, { currency: props.currency, locale: props.locale });

  return parts.prefix + parts.amount + parts.digits + parts.suffix;
});

const config = computed(() => ({
  decimal: props.decimal ?? separators.value.decimal,
  precision: props.precision,
  prefix: (props.prefix ?? separators.value.symbol).concat(' '),
  suffix: props.suffix,
  thousands: props.thousands ?? separators.value.thousands,
}));
</script>

<template>
  <Money3Component
      v-model.number="money"
      :max="props.max"
      :min="props.min"
      :placeholder="placeholder"
      class="form-control"
      v-bind="config"
  />
</template>
