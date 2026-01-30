<script lang="ts" setup>
import type { BaseButtonVariant, BaseSize } from 'bootstrap-vue-next';
import { computed, useSlots } from 'vue';

const props = defineProps({
  size: { type: String as PropType<keyof BaseSize>, default: () => 'sm' },
  text: { type: String, default: () => 'Actions' },
  variant: { type: String as PropType<keyof BaseButtonVariant> },
  solid: { type: Boolean, default: () => false },
});

const slots = useSlots();

const noDefault = computed(() => !slots.default);
</script>

<template>
  <BDropdown :disabled="noDefault" :size="props.size" :text="props.text" :variant="props.variant" auto-close="outside">
    <slot />
  </BDropdown>
</template>
