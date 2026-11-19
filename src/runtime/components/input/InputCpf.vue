<script lang="ts" setup>
import { computed } from '#imports';
import { formatCpf, isValidCpf } from '@brazilian-utils/brazilian-utils';
import type { PropType } from 'vue';
import { toDigits } from '../../internal/digits';

const LENGTH = 11;

const cpf = defineModel({ type: String, default: () => String() }); // raw digits

const props = defineProps({
  state: { type: Boolean as PropType<boolean | null>, default: undefined }, // overrides the automatic one: invalid once complete
});

const digits = computed(() => toDigits(cpf.value, LENGTH));

const isValid = computed(() => isValidCpf(digits.value));

const state = computed(() => {
  if (props.state !== undefined) return props.state;

  return digits.value.length === LENGTH && !isValid.value ? false : null;
});

const format = (value: string) => formatCpf(toDigits(value, LENGTH));

const update = (value: unknown) => (cpf.value = toDigits(value, LENGTH));

defineExpose({ isValid });
</script>

<template>
  <BFormInput
      :formatter="format"
      :model-value="formatCpf(digits)"
      :state="state"
      autocomplete="off"
      inputmode="numeric"
      placeholder="000.000.000-00"
      @update:model-value="update"
  />
</template>
