<script lang="ts" setup>
const props = defineProps({
  date: { type: [String, Date], default: () => new Date() },
  format: { type: String as PropType<'short' | 'relative'>, default: () => null },
});

const bindAttrs = computed(() => {
  const attrs: Record<string, any> = {
    day: 'numeric',
    month: 'short',
    relative: props.format === 'relative' || undefined,
    year: 'numeric',
  };

  if (props.format !== 'short') {
    attrs['hour'] = 'numeric';
    attrs['minute'] = 'numeric';
  }

  return attrs;
});
</script>

<template>
  <NuxtTime :datetime="props.date" class="small" v-bind="bindAttrs" />
</template>
