<script lang="ts" setup>
import { computed } from '#imports';
import { formatPhone, isValidLandlinePhone, isValidMobilePhone } from '@brazilian-utils/brazilian-utils';
import type { PropType } from 'vue';
import { toDigits } from '../../internal/digits';

const LENGTH = 11; // DDD + mobile; a landline has 10

const phone = defineModel({ type: String, default: () => String() }); // raw digits, DDD included

const props = defineProps({
  state: { type: Boolean as PropType<boolean | null>, default: undefined }, // overrides the automatic one: invalid once complete
});

const digits = computed(() => toDigits(phone.value, LENGTH));

const isValid = computed(() => isValidMobilePhone(digits.value) || isValidLandlinePhone(digits.value));

const isComplete = computed(() => digits.value.length === LENGTH || (digits.value.length === 10 && digits.value[2] !== '9')); // a 9 after the DDD is a mobile still being typed

const state = computed(() => {
  if (props.state !== undefined) return props.state;

  return isComplete.value && !isValid.value ? false : null;
});

const mask = (value: string) => formatPhone(value, { mask: 'nanp' }); // (00) 00000-0000 or (00) 0000-0000

const format = (value: string) => mask(toDigits(value, LENGTH));

const update = (value: unknown) => (phone.value = toDigits(value, LENGTH));

defineExpose({ isValid });
</script>

<template>
  <BFormInput
      :formatter="format"
      :model-value="mask(digits)"
      :state="state"
      autocomplete="tel-national"
      inputmode="tel"
      placeholder="(00) 00000-0000"
      @update:model-value="update"
  />
</template>
