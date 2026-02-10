<script lang="ts" setup>
import type { BaseButtonVariant, BaseSize } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { computed, useSlots } from 'vue';
import FormatIcon from '../format/FormatIcon.vue';

const props = defineProps({
  size: { type: String as PropType<keyof BaseSize>, default: () => 'sm' },
  icon: { type: String, default: () => 'ellipsis-v' },
  text: { type: String, default: () => '' },
  variant: { type: String as PropType<keyof BaseButtonVariant>, default: () => undefined },
  solid: { type: Boolean, default: () => false },
});

const slots = useSlots();

const noDefault = computed(() => !slots.default);
</script>

<template>
  <BDropdown
    :disabled="noDefault"
    :size="props.size"
    :text="props.text"
    :variant="props.variant"
    auto-close="outside"
    no-caret>
    <template #button-content>
      <FormatIcon :name="props.icon" :text="props.text" />
    </template>
    <slot />
  </BDropdown>
</template>
