<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps({
  city: { type: String, default: '' },
  code: { type: String, default: '' },
  country: { type: String, default: '' },
  line1: { type: String, default: '' },
  line2: { type: String, default: '' },
  locality: { type: String, default: '' },
  state: { type: String, default: '' },
});

const lines = computed(() => {
  const parts: string[] = [];

  if (props.line1) parts.push(props.line1);
  if (props.line2) parts.push(props.line2);

  const cityLine = [props.city, props.state].filter(Boolean).join(', ');
  const cityWithCode = [cityLine, props.code].filter(Boolean).join(' ');
  if (cityWithCode) parts.push(cityWithCode);

  if (props.locality) parts.push(props.locality);
  if (props.country) parts.push(props.country);

  return parts;
});
</script>

<template>
  <address>
    <template v-for="(line, i) in lines" :key="i">
      {{ line }}<br v-if="i < lines.length - 1">
    </template>
  </address>
</template>

<style lang="scss" scoped>
address {
  margin: 0;
}
</style>
