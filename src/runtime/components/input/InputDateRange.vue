<script lang="ts" setup>
import type { PropType } from '#imports';
import { ref, computed, onBeforeMount } from '#imports';
import FormatIcon from '../format/FormatIcon.vue';

type PresetKey = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth';

interface DateRange {
  start: Date;
  end: Date;
  preset: PresetKey;
}

const props = defineProps({
  disabled: { type: Boolean, default: false },
  preset: { type: String as PropType<PresetKey>, default: () => 'today' },
});

const model = defineModel<DateRange>();

const presets = [
  { key: 'today', label: 'Today', icon: 'calendar-day' },
  { key: 'yesterday', label: 'Yesterday', icon: 'calendar-minus' },
  { key: 'last7days', label: 'Last 7 days', icon: 'calendar-week' },
  { key: 'last30days', label: 'Last 30 days', icon: 'calendar' },
  { key: 'thisMonth', label: 'This month', icon: 'calendar-check' },
  { key: 'lastMonth', label: 'Last month', icon: 'calendar-xmark' },
] as const;

const selectedPreset = ref<PresetKey>(model.value?.preset || props.preset);

const getDateRange = (preset: PresetKey): Omit<DateRange, 'preset'> => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return { start: today, end: today };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
    case 'last7days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { start, end: today };
    }
    case 'last30days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { start, end: today };
    }
    case 'thisMonth': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { start, end: today };
    }
    case 'lastMonth': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      return { start, end };
    }
    default:
      return { start: today, end: today };
  }
};

const currentPresetLabel = computed(() => {
  return presets.find((p) => p.key === selectedPreset.value)?.label || 'Select';
});

const formatDateRange = computed(() => {
  const range = getDateRange(selectedPreset.value);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

  if (range.start.getTime() === range.end.getTime()) {
    return range.start.toLocaleDateString('en', { ...options, year: 'numeric' });
  }

  const startStr = range.start.toLocaleDateString('en', options);
  const endStr = range.end.toLocaleDateString('en', { ...options, year: 'numeric' });
  return `${startStr} - ${endStr}`;
});

const selectPreset = (preset: PresetKey) => {
  selectedPreset.value = preset;
  model.value = { ...getDateRange(preset), preset };
};

// Initialize with preset
onBeforeMount(() => selectPreset(props.preset));
</script>

<template>
  <BDropdown :disabled="disabled" menu-class="w-250px" size="sm" toggle-class="d-flex align-items-center gap-2">
    <template #button-content>
      <FormatIcon class="text-gray-600" name="calendar-days" />
      <span class="text-gray-800 fw-semibold" v-text="currentPresetLabel" />
      <span class="fs-8 d-none d-md-inline" v-text="formatDateRange" />
    </template>

    <div class="px-3 py-2 border-bottom">
      <span class="fs-7 fw-bold text-gray-800">Date Range</span>
    </div>

    <template v-for="preset in presets" :key="preset.key">
      <BDropdownItem :active="selectedPreset === preset.key" @click="selectPreset(preset.key)">
        <div class="d-flex align-items-center gap-2">
          <FormatIcon :name="preset.icon" class="text-gray-500" />
          <span v-text="preset.label" />
        </div>
      </BDropdownItem>
    </template>

    <BDropdownDivider />

    <BDropdownItem disabled>
      <div class="d-flex align-items-center gap-2 text-muted">
        <FormatIcon name="calendar-plus" />
        <span>Custom range (coming soon)</span>
      </div>
    </BDropdownItem>
  </BDropdown>
</template>
