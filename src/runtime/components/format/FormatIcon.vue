<script lang="ts" setup>
import type { ColorVariant } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { computed } from 'vue';

const props = defineProps({
  mode: { type: String, default: 'duotone' },
  name: { type: String, required: true },
  opacity: { type: [String, Number], default: () => '' },
  provider: { type: String, default: 'fa' },
  reversed: { type: Boolean, default: false },
  size: { type: String, default: () => '' },
  spin: { type: Boolean, default: false },
  tag: { type: String, default: () => 'i' },
  text: { type: String, default: () => '' },
  variant: { type: String as PropType<ColorVariant | string>, default: () => '' },
});

const iconName = computed(() => `${props.provider}-${props.name}`);
const iconMode = computed(() => `${props.provider}-${props.mode}`);
const animateSpin = computed(() => props.spin ? `${props.provider}-spin` : undefined);
const iconOpacity = computed(() => props.opacity ? `opacity-${props.opacity}` : undefined);
const fontSize = computed(() => props.size ? `fs-${props.size}` : undefined);
const fontColor = computed(() => props.variant ? `text-${props.variant}` : undefined);

const classList = computed(() => [
  iconName.value,
  iconMode.value,
  animateSpin.value,
  iconOpacity.value,
  fontSize.value,
  fontColor.value,
].filter(Boolean));
</script>

<template>
  <template v-if="props.text">
    <span :class="{ 'flex-row-reverse': props.reversed }" class="d-flex align-items-center">
      <component :is="props.tag" :class="classList" />
      <span class="ps-1" v-text="props.text" />
    </span>
  </template>

  <component :is="props.tag" v-else :class="classList" />
</template>
