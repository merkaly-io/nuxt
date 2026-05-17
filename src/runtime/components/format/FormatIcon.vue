<script lang="ts" setup>
import type { ColorVariant, AlignmentVertical, AlignmentHorizontal } from 'bootstrap-vue-next';
import type { PropType } from 'vue';
import { computed } from 'vue';

const props = defineProps({
  alignH: { type: String as PropType<AlignmentHorizontal>, default: () => 'start' },
  alignV: { type: String as PropType<AlignmentVertical>, default: () => 'center' },
  mode: { type: String, default: 'regular' },
  name: { type: String, required: true },
  opacity: { type: [String, Number], default: () => '' },
  provider: { type: String, default: 'fa' },
  reversed: { type: Boolean, default: false },
  rotate: { type: [Number, String] as PropType<'90' | 90 | '180' | 180 | '270' | 270>, default: undefined },
  size: { type: String, default: () => '' },
  spin: { type: Boolean, default: false },
  tag: { type: String, default: () => 'i' },
  text: { type: String, default: () => '' },
  variant: { type: String as PropType<ColorVariant | string>, default: () => '' },
});

const slots = defineSlots();

const hasContent = computed(() => Boolean(slots.default || props.text));

const iconName = computed(() => `${props.provider}-${props.name}`);
const iconMode = computed(() => `${props.provider}-${props.mode}`);
const animateSpin = computed(() => props.spin ? `${props.provider}-spin` : undefined);
const iconOpacity = computed(() => props.opacity ? `opacity-${props.opacity}` : undefined);
const iconRotate = computed(() => props.rotate ? `fa-rotate-${props.rotate}` : undefined);
const fontSize = computed(() => props.size ? `fs-${props.size}` : undefined);
const fontColor = computed(() => props.variant ? `text-${props.variant}` : undefined);

const classList = computed(() => [
  iconName.value,
  iconMode.value,
  iconRotate.value,
  animateSpin.value,
  iconOpacity.value,
  fontSize.value,
  fontColor.value,
].filter(Boolean));

const wrapperClass = computed(() => [
  'd-flex',
  `justify-content-${props.alignH}`,
  `align-items-${props.alignV}`,
  { 'flex-row-reverse': props.reversed },
]);

defineOptions({
  inheritAttrs: false,
});
</script>

<template>
  <template v-if="hasContent">
    <span :class="wrapperClass">
      <component :is="props.tag" :class="classList" v-bind="$attrs" />

      <slot>
        <span :class="fontColor" class="ps-1" v-text="props.text" />
      </slot>
    </span>
  </template>

  <component :is="props.tag" v-else :class="classList" v-bind="$attrs" />
</template>
