<script lang="ts" setup>
import type { Numberish } from 'bootstrap-vue-next/dist/src/types/CommonTypes';
import { Money3Component } from 'v-money3';

const money = defineModel<Numberish>({
  default: () => 0,
  get: v => v / 100,
  set: v => v * 100,
  type: [String, Number],
});

const props = defineProps({
  decimal: { type: String, default: () => '.' },
  max: { type: Number, required: false, default: undefined },
  min: { type: Number, default: () => 0 },
  placeholder: { type: String, default: () => '$0.00' },
  precision: { type: Number, default: () => 2 },
  prefix: { type: String, default: () => '$' },
  suffix: { type: String, default: () => ' ' },
  thousands: { type: String, default: () => ',' },
});

const config = computed(() => ({
  decimal: props.decimal,
  precision: props.precision,
  prefix: props.prefix.concat(' '),
  suffix: props.suffix,
  thousands: props.thousands,
}));
</script>

<template>
  <Money3Component
      v-model.number="money"
      :max="props.max"
      :min="props.min"
      :placeholder="props.placeholder"
      class="form-control"
      v-bind="config"
  />
</template>
