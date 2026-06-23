<script lang="ts" setup>
import { watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import FormatIcon from '../format/FormatIcon.vue';

const props = defineProps({
  debounce: { type: Number, default: () => 300 },
});

const search = defineModel({ type: String, default: () => String() });

const emit = defineEmits<{ change: [] }>();

// Debounce search-as-you-type so consumers fetch once the user pauses, not per keystroke.
const emitChange = useDebounceFn(() => emit('change'), props.debounce);

watch(search, () => emitChange());
</script>

<template>
  <div class="d-flex align-items-center position-relative">
    <BFormInput v-model="search" class="form-control-solid border" placeholder="Search..." />

    <FormatIcon class="position-absolute me-3 end-0" mode="regular" name="search" size="4" variant="primary" />
  </div>
</template>
