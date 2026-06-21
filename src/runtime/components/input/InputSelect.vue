<script generic="T extends Record<string, any>" lang="ts" setup>
import type { PropType } from 'vue';
import { computed, onBeforeMount } from 'vue';
import type { Size } from 'bootstrap-vue-next';
import { useDebounceFn } from '@vueuse/core';
import type { OptionConsumer, VueSelectProps } from 'vue-select';
import VSelect from 'vue-select';
import FormatIcon from '../format/FormatIcon.vue';

const emit = defineEmits<{
  (e: 'request:selected' | 'search', v: string): unknown;
}>();

const props = defineProps({
  debounce: { type: Number, default: () => 250 },
  disabled: { type: Boolean, default: () => false },
  fieldDisabled: { type: Function as PropType<(item: T) => boolean>, default: undefined },
  fieldSort: { type: Function as PropType<(item: T) => string>, default: (it: Record<string, unknown>) => it.fieldText },
  fieldText: { type: Function as PropType<(item: T) => string>, default: ((it: Record<string, unknown>) => it.name) },
  fieldValue: { type: Function as PropType<(item: T) => unknown>, default: ((it: Record<string, unknown>) => it._id) },
  filterable: { type: Boolean, default: () => true },
  loading: { type: Boolean, default: () => false },
  multiple: { type: Boolean, default: () => false },
  noClear: { type: Boolean, default: () => false },
  noCloseOnSelect: { type: Boolean, default: () => false },
  options: { type: Array as PropType<T[]>, default: () => [] },
  placeholder: { type: String, default: () => undefined },
  required: { type: Boolean, default: () => false },
  selectedItem: { type: Object as PropType<T>, default: undefined },
  size: { type: String as PropType<Size>, default: () => undefined },
});

const model = defineModel({ type: [String, Object, Number, Boolean, Array], default: undefined });

onBeforeMount(() => {
  if (props.selectedItem) return;
  if (model.value) {
    emit('request:selected', model.value);
  }
});

function filterItems(options: T[], search: string) {
  if (!props.fieldText) {
    return false;
  }

  return options.filter((item) => {
    const text: string = props.fieldText?.(item) || '';

    return text.toLocaleLowerCase().includes(search.toLowerCase());
  });
}

const sortedOptions = computed<T[]>(() => {
  const options = props.options;

  return options.sort((prev, next) => {
    const textPrev = props.fieldSort(prev)?.toLowerCase?.();
    const textNext = props.fieldSort(next)?.toLowerCase?.();

    if (textPrev > textNext) {
      return 1;
    }

    if (textPrev < textNext) {
      return -1;
    }

    return 0;
  });
});

const mergedOptions = computed<T[]>(() => {
  const options = sortedOptions.value;
  const selected = props.selectedItem as T | undefined;

  if (!selected) return options;

  const filtered = options.filter(
    (item) => props.fieldValue(item) !== props.fieldValue(selected),
  );

  return [selected, ...filtered];
});

const bindAttrs = computed<Partial<VueSelectProps>>(() => ({
  appendToBody: true,
  autocomplete: 'one-time-code',
  clearable: props.disabled ? false : !props.noClear,
  closeOnSelect: props.multiple ? false : !props.noCloseOnSelect,
  disabled: props.disabled,
  filter: filterItems as OptionConsumer<never>,
  filterable: props.filterable,
  getOptionLabel: props.fieldText,
  loading: props.loading,
  options: mergedOptions.value as VueSelectProps['options'],
  placeholder: props.placeholder,
  readonly: props.loading,
  reduce: (option: VueSelectProps['options'][number]) => props.fieldValue?.(option as T),
  selectable: props.fieldDisabled as OptionConsumer<boolean>,
}));

const bindOn = {
  search: (value: string) => {
    if (value) debouncedFn(value);

    return value;
  },
};

const debouncedFn = useDebounceFn((value: string) => emit('search', value), props.debounce);

const isRequired = computed(() => {
  const isEmpty = props.multiple
    ? !model.value?.length
    : !model.value;

  return props.required && isEmpty ? true : undefined;
});
</script>

<template>
  <VSelect v-model="model" v-bind="bindAttrs" v-on="bindOn">
    <template #search="scope">
      <input
        :required="isRequired"
        class="vs__search"
        v-bind="scope.attributes"
        v-on="scope.events">
    </template>

    <template #option="scope">
      <slot v-bind="{ item: scope as T, text: props.fieldText?.(scope), selectedOption: false }">
        <div class="text-truncate">
          <span v-text="props.fieldText?.(scope)" />
        </div>
      </slot>
    </template>

    <template #selected-option="scope">
      <span v-text="props.fieldText?.(scope)" />
    </template>

    <template #footer>
      <span :required="props.required || undefined" />
    </template>

    <template #spinner="{ loading: isLoading }">
      <BSpinner v-if="isLoading" class="spinner" variant="primary" />
    </template>

    <template #no-options="scope">
      <slot name="no-options" v-bind="scope">
        <span v-if="scope.loading">Searching for "{{ scope.search }}"</span>
        <span v-else-if="scope.searching">No results for "{{ scope.search }}"</span>
        <span v-else>Type to search</span>
      </slot>
    </template>

    <template #open-indicator="{ attributes }">
      <FormatIcon mode="solid" name="chevron-down" size="lg" v-bind="attributes" />
    </template>
  </VSelect>
</template>

<style lang="scss" scoped>
.spinner {
  --bs-spinner-width: 1.25rem;
  --bs-spinner-height: 1.25rem;
  --bs-spinner-border-width: 0.15em;
}
</style>
