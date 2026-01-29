<script lang="ts" setup>
const props = defineProps({
  fallback: { type: String, required: false },
  tag: { type: String, default: () => 'span' },
  template: { type: String, required: true },
  values: { type: Object as PropType<Record<string, unknown>>, required: false },
});

const slots = useSlots();

const contentParts = computed(() => {
  // Regex para detectar tokens tipo :key:
  const regex = /:([a-zA-Z0-9_]+):/g;
  const parts: (string | { slotName: string })[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while((match = regex.exec(props.template)) !== null) {
    const [fullMatch, key] = match;
    const index = match.index;

    // Agrega texto antes del token
    if (index > lastIndex) {
      parts.push(props.template.slice(lastIndex, index));
    }

    // Si hay slot para esta key
    if (slots[key]) {
      parts.push({ slotName: key });
    } else {
      const value = props.values?.[key];
      parts.push(value != null ? String(value) : props.fallback ?? fullMatch);
    }

    lastIndex = index + fullMatch.length;
  }

  // Agrega el resto del string
  if (lastIndex < props.template.length) {
    parts.push(props.template.slice(lastIndex));
  }

  return parts;
});
</script>

<template>
  <component :is="props.tag">
    <template v-for="(part, i) in contentParts" :key="i">
      <template v-if="typeof part === 'string'">
        <span v-text="part" />
      </template>

      <template v-else>
        <slot :name="part.slotName" />
      </template>
    </template>
  </component>
</template>
