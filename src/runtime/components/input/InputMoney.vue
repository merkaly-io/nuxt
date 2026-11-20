<script lang="ts" setup>
import { computed, useAttrs, useId } from '#imports';
import type { PropType } from 'vue';
import { Money3Component } from 'v-money3';
import { useMoneyFormat } from '../../composables/useMoneyFormat';
import { isCurrencyCode } from '../../utils/formatMoney';

type Numberish = string | number; // bootstrap-vue-next no longer exports it

const money = defineModel<Numberish>({
  default: () => 0,
  get: v => Number(v) / 100, // same coercion as the bare operator
  set: v => Math.trunc(Number(v) * 100),
  type: [String, Number],
});

const attrs = useAttrs();
const generatedId = useId();
const inputId = computed(() => (attrs.id as string | undefined) ?? generatedId); // v-money3 defaults to a random id: SSR and client differ

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
  size: { type: String as PropType<'sm' | 'md' | 'lg'>, default: undefined }, // like BFormInput: form-control-sm/lg, never the native <input size>
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

const sizeClass = computed(() => (props.size && props.size !== 'md' ? `form-control-${props.size}` : undefined));

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
      :id="inputId"
      v-model.number="money"
      :max="props.max"
      :min="props.min"
      :placeholder="placeholder"
      :class="sizeClass"
      class="form-control"
      v-bind="config"
  />
</template>
