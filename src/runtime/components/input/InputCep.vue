<script lang="ts" setup>
import { computed } from '#imports';
import { formatCep, isValidCep } from '@brazilian-utils/brazilian-utils';
import type { PropType } from 'vue';
import { toDigits } from '../../internal/digits';

const LENGTH = 8;

const cep = defineModel({ type: String, default: () => String() }); // raw digits

const props = defineProps({
  state: { type: Boolean as PropType<boolean | null>, default: undefined }, // overrides the automatic one: invalid once complete
});

const digits = computed(() => toDigits(cep.value, LENGTH));

const isValid = computed(() => isValidCep(digits.value));

const state = computed(() => {
  if (props.state !== undefined) return props.state;

  return digits.value.length === LENGTH && !isValid.value ? false : null;
});

const format = (value: string) => formatCep(toDigits(value, LENGTH));

const update = (value: unknown) => (cep.value = toDigits(value, LENGTH));

defineExpose({ isValid });
</script>

<template>
  <BFormInput
      :formatter="format"
      :model-value="formatCep(digits)"
      :state="state"
      autocomplete="postal-code"
      inputmode="numeric"
      placeholder="00000-000"
      @update:model-value="update"
  />
</template>
