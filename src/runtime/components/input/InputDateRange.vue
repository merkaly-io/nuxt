<script lang="ts" setup>
import type { PropType } from 'vue';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
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

const { locale, t } = useI18n({ useScope: 'local' });

const presets = [
  { key: 'today', icon: 'calendar-day' },
  { key: 'yesterday', icon: 'calendar-minus' },
  { key: 'last7days', icon: 'calendar-week' },
  { key: 'last30days', icon: 'calendar' },
  { key: 'thisMonth', icon: 'calendar-check' },
  { key: 'lastMonth', icon: 'calendar-xmark' },
] as const;

const selectedPreset = ref<PresetKey>(model.value?.preset || props.preset);

const getDateRange = (key: PresetKey): Omit<DateRange, 'preset'> => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (key) {
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
  const preset = presets.find((p) => p.key === selectedPreset.value);

  return preset ? t(preset.key) : t('select');
});

const formatDateRange = computed(() => {
  const range = getDateRange(selectedPreset.value);
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };

  if (range.start.getTime() === range.end.getTime()) {
    return range.start.toLocaleDateString(locale.value, { ...options, year: 'numeric' });
  }

  const startStr = range.start.toLocaleDateString(locale.value, options);
  const endStr = range.end.toLocaleDateString(locale.value, { ...options, year: 'numeric' });
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
      <span class="fs-7 fw-bold text-gray-800" v-text="t('title')" />
    </div>

    <template v-for="item in presets" :key="item.key">
      <BDropdownItem :active="selectedPreset === item.key" @click="selectPreset(item.key)">
        <div class="d-flex align-items-center gap-2">
          <FormatIcon :name="item.icon" class="text-gray-500" />
          <span v-text="t(item.key)" />
        </div>
      </BDropdownItem>
    </template>

    <BDropdownDivider />

    <BDropdownItem disabled>
      <div class="d-flex align-items-center gap-2 text-muted">
        <FormatIcon name="calendar-plus" />
        <span v-text="t('custom')" />
      </div>
    </BDropdownItem>
  </BDropdown>
</template>

<i18n lang="json">
{
  "en": {
    "title": "Date range",
    "select": "Select",
    "today": "Today",
    "yesterday": "Yesterday",
    "last7days": "Last 7 days",
    "last30days": "Last 30 days",
    "thisMonth": "This month",
    "lastMonth": "Last month",
    "custom": "Custom range (coming soon)"
  },
  "pt": {
    "title": "Período",
    "select": "Selecionar",
    "today": "Hoje",
    "yesterday": "Ontem",
    "last7days": "Últimos 7 dias",
    "last30days": "Últimos 30 dias",
    "thisMonth": "Este mês",
    "lastMonth": "Mês passado",
    "custom": "Período personalizado (em breve)"
  }
}
</i18n>
