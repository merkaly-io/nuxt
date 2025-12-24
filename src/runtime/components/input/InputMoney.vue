<script lang="ts" setup>
import { computed } from '#imports';
import { Money3Component } from 'v-money3';

const model = defineModel<string | number>({
  default: () => 0,
  get: v => v / 100,
  set: v => v * 100,
  type: [String, Number],
});

const props = defineProps({
  decimal: { type: String, default: () => '.' },
  thousands: { type: String, default: () => ',' },
  precision: { type: Number, default: () => 2 },
  prefix: { type: String, default: () => '' },
  suffix: { type: String, default: () => '' },
  min: { type: Number, default: undefined },
  max: { type: Number, default: undefined },
  placeholder: { type: String, default: () => '0.00' },
});

const config = computed(() => ({
  class: 'form-control',
  decimal: props.decimal,
  max: props.max,
  min: props.min,
  placeholder: props.placeholder,
  precision: props.precision,
  prefix: props.prefix ? `${props.prefix} ` : '',
  suffix: props.suffix,
  thousands: props.thousands,
}));
</script>

<template>
  <Money3Component v-model="model" v-bind="config" />
</template>
