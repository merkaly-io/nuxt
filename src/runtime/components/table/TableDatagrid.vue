<script generic="G" lang="ts" setup>
import { sentenceCase } from 'change-case';
import { computed, getCurrentInstance, useSlots } from 'vue';
import DropdownIcon from '../dropdown/DropdownIcon.vue';
import FormatIcon from '../format/FormatIcon.vue';
import FormatText from '../format/FormatText.vue';
import InputSearch from '../input/InputSearch.vue';
import type { DataGrid } from '../../composables/useDatagrid';

type FetchReason = 'paginate' | 'refresh' | 'search' | 'sort' | 'filter';

const emit = defineEmits<{
  (e: 'fetch', reason: FetchReason): void
  (e: 'toggle:item', item: G, expanded: boolean): void
}>();

const slots = useSlots();

const props = defineProps({
  emptyText: { type: String, default: () => 'No items found' },
  hideFooter: { type: Boolean, default: false },
  hidePagination: { type: Boolean, default: false },
  hideSelect: { type: Boolean, default: false },
});

const $datagrid = defineModel<DataGrid<G>>({ type: Object, required: true });

const instance = getCurrentInstance();
const canFetch = Boolean(instance?.vnode?.props?.onFetch);
const canFilter = Boolean(slots.filters);
const hasDetails = computed(() => Boolean(slots['details']));
const hasActions = computed(() => Boolean(slots['actions']));

const visibleColumns = computed(() => Object.entries($datagrid.value.columns));

const tableColspan = computed(() => {
  const baseColumns = 2; // left + right empty columns
  const selectColumn = props.hideSelect ? 0 : 1;
  return visibleColumns.value.length + baseColumns + selectColumn;
});

const paginationText = computed(() => {
  const page = $datagrid.value.page || 1;
  const limit = $datagrid.value.limit || 10;
  const total = $datagrid.value.total || $datagrid.value.items.length;

  let start = (page - 1) * limit + 1;

  if (!$datagrid.value.items.length) {
    start = 0;
  }

  const end = Math.min(page * limit, total);

  return {
    template: 'Showing :current: to :final: of :total: items',
    values: {
      current: start,
      final: end,
      total,
    },
  };
});

const visibleItems = computed(() => {
  if (canFetch) {
    return $datagrid.value.items;
  }

  const start = Math.max(0, paginationText.value.values.current - 1);

  return $datagrid.value.items.slice(start, paginationText.value.values.final);
});

const checkboxAllAttrs = computed(() => {
  const attrs: Record<string, any> = {};
  const values = $datagrid.value.items.map(it => it._checked);

  const allChecked = values.length > 0 && values.every(Boolean);
  const someChecked = values.some(Boolean);

  attrs['checked'] = allChecked;
  attrs['indeterminate'] = !allChecked && someChecked;

  return attrs;
});

function toggleCheckAll() {
  const allChecked = $datagrid.value.items.every(it => it._checked);
  $datagrid.value.items.forEach(it => it._checked = !allChecked);
}

function getItemValue(item: G, key: string): unknown {
  return (item as Record<string, unknown>)[key];
}

function toggleDetails(item: G) {
  const record = item as Record<string, unknown>;
  record._showDetails = !record._showDetails;
  emit('toggle:item', item, Boolean(record._showDetails));
}
</script>

<template>
  <BCard no-body>
    <BCardHeader class="align-items-center p-4">
      <BCardTitle>
        <slot name="search">
          <InputSearch :disabled="$datagrid.loading" class="w-250px" />
        </slot>
      </BCardTitle>

      <div class="card-toolbar flex-row-fluid justify-content-end gap-3 m-0">
        <slot name="toolbar" />

        <template v-if="canFilter">
          <BDropdown
            :disabled="$datagrid.loading"
            auto-close="outside"
            menu-class="w-400px pb-0"
            no-caret
            toggle-class="btn-icon h-40px w-40px"
            variant="light">
            <template #button-content>
              <FormatIcon name="bars-filter" />
            </template>

            <BDropdownHeader text="Filters:" />
            <BDropdownDivider />

            <BDropdownForm>
              <slot name="filters" />


              <BDropdownDivider />

              <div class="d-flex justify-content-between align-items-center">
                <BButton size="sm">
                  <FormatIcon name="ban" text="Cancel" />
                </BButton>

                <BButton size="sm" variant="light-success">
                  <FormatIcon name="thumbs-up" text="Apply" />
                </BButton>
              </div>
            </BDropdownForm>
          </BDropdown>
        </template>

        <template v-if="canFetch">
          <BButton
            :disabled="$datagrid.loading"
            class="h-40px w-40px btn-icon border"
            size="sm"
            variant="active-light-primary"
            @click="emit('fetch', 'refresh')">
            <FormatIcon :spin="$datagrid.loading" name="rotate" variant="primary" />
          </BButton>
        </template>
      </div>
    </BCardHeader>

    <BTableSimple
      :class="{ 'h-100': !visibleItems.length || $datagrid.loading }"
      class="mb-0"
      hover
      responsive="lg"
      small
      table-class="align-middle table-row-dashed gy-3 h-100">
      <BThead class="sticky-top z-index-1">
        <BTr class="text-start text-body-secondary fw-bold fs-7 text-uppercase gs-0">
          <BTh v-if="hasDetails" class="p-0 w-25px" />

          <BTh v-if="!props.hideSelect" class="w-40px px-0">
            <div class="form-check form-check-sm form-check-custom cell-checkbox">
              <input
                :disabled="$datagrid.loading"
                class="form-check-input"
                type="checkbox"
                v-bind="checkboxAllAttrs"
                @input="toggleCheckAll()">
            </div>
          </BTh>

          <template v-for="(column, key) in $datagrid.columns" :key="key">
            <BTh :class="[column.class, column.thClass]">
              <span v-text="column.title ?? sentenceCase(key)" />
            </BTh>
          </template>

          <BTh v-if="hasActions" class="text-end px-3" />
        </BTr>
      </BThead>

      <BTbody v-if="$datagrid.loading">
        <BTd :colspan="tableColspan">
          <div class="text-center">
            <BSpinner variant="primary" />
          </div>
        </BTd>
      </BTbody>

      <BTbody v-else-if="!visibleItems.length">
        <BTd :colspan="tableColspan">
          <slot name="empty">
            <div class="text-center text-muted" v-text="props.emptyText" />
          </slot>
        </BTd>
      </BTbody>

      <BTbody v-else class="fw-semibold text-gray-600">
        <template v-for="(item, idx) in visibleItems" :key="idx">
          <BTr>
            <BTd v-if="hasDetails" class="p-0 w-25px">
              <BButton
                class="w-25px h-100 rounded-0 p-0 bg-light bg-hover-light-secondary border-end border-dashed"
                size="sm"
                variant="none"
                @click="toggleDetails(item)">
                <FormatIcon :name="item._showDetails ? 'chevron-down' : 'chevron-right'" size="sm" variant="primary" />
              </BButton>
            </BTd>

            <BTd v-if="!props.hideSelect" class="w-40px px-0">
              <div class="form-check form-check-sm form-check-custom cell-checkbox">
                <input v-model="item._checked" :disabled="$datagrid.loading" class="form-check-input" type="checkbox">
              </div>
            </BTd>

            <template v-for="(column, key) in $datagrid.columns" :key="key">
              <BTd :class="[column.class, column.tdClass]">
                <slot :name="`row[${key}]`" v-bind="{ column, idx, item, key }">
                  <span v-text="column.getter?.(item) || getItemValue(item, key)" />
                </slot>
              </BTd>
            </template>

            <BTd v-if="hasActions" class="text-end px-3">
              <DropdownIcon toggle-class="border border-secondary-subtle border-dashed text-body">
                <slot :index="idx" :item="item" name="actions" />
              </DropdownIcon>
            </BTd>
          </BTr>

          <BTr v-if="hasDetails && item._showDetails">
            <BTd :colspan="tableColspan" class="p-0">
              <slot
                :index="idx"
                :item="item"
                :toggle-details="() => toggleDetails(item)"
                name="details" />
            </BTd>
          </BTr>
        </template>
      </BTbody>

      <BTfoot>
        <slot name="tfoot" />
      </BTfoot>

    </BTableSimple>

    <BCardFooter v-if="!props.hideFooter" class="p-4">
      <slot name="footer" />

      <BRow v-if="!props.hidePagination" align-h="between" align-v="center">
        <BCol cols="auto">
          <select v-model="$datagrid.limit" class="form-select form-select-sm form-select-solid" disabled>
            <BFormSelectOption :value="10">10</BFormSelectOption>
          </select>
        </BCol>

        <BCol v-show="!$datagrid.loading" cols="auto">
          <BPagination
            v-model="$datagrid.page"
            :disabled="$datagrid.loading"
            :per-page="$datagrid.limit"
            :total-rows="$datagrid.total"
            class="mb-0"
            no-goto-end-buttons
            @update:model-value="emit('fetch', 'paginate')" />
        </BCol>

        <BCol class="fs-7 text-muted" cols="auto">
          <span v-if="$datagrid.loading">Loading...</span>
          <FormatText v-else :template="paginationText.template" :values="paginationText.values" />
        </BCol>
      </BRow>
    </BCardFooter>
  </BCard>
</template>

<style lang="scss" scoped>
.cell-checkbox {
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  width: 2em;

  input {
    cursor: pointer;
  }
}

thead {
  background: var(--bs-body-bg);

  &:before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: rgb(var(--bs-primary-rgb), .05);
  }
}
</style>
