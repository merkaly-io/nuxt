import { reactive } from 'vue';

export interface ColumnDefinition<C = unknown> {
  class?: string;
  getter?: (row: C) => unknown;
  tdClass?: string;
  thClass?: string;
  title?: string;
  type?: unknown;
}

export type DataGridItem<C> = C;
export type DataGridAddItemMode = 'append' | 'prepend';

export interface DataGridAddItemOptions {
  mode?: DataGridAddItemMode;
}

export type DataGridRowAttrs = Record<string, unknown>;
export type DataGridRowKey = string | number;

export interface DataGridRowDefinition {
  attrs?: DataGridRowAttrs;
  class?: string;
  key?: DataGridRowKey;
}

export interface DataGrid<C = unknown> {
  columns: Record<string, ColumnDefinition<C>>;
  error: unknown;
  fn: {
    addItem: (item: C, options?: DataGridAddItemOptions) => DataGridItem<C>[];
    removeItem: (predicate: (item: DataGridItem<C>, index: number) => boolean) => number;
  };
  items: DataGridItem<C>[];
  limit: number;
  loading: boolean;
  page: number;
  row?: (item: C, index: number) => DataGridRowDefinition;
  search: string;
  total: number;
}

interface OptionArgs<D> {
  columns: Record<string, ColumnDefinition<D>>;
  error?: unknown;
  items?: D[];
  limit?: number;
  loading?: boolean;
  row?: (item: D, index: number) => DataGridRowDefinition;
  search?: string;
  total?: number;
}

export function useDatagrid<D = unknown>(params: OptionArgs<D>): DataGrid<D> {
  const state = reactive({
    columns: params.columns,
    error: params.error ?? null,
    fn: {
      addItem(item: D, options: DataGridAddItemOptions = {}) {
        const mode = options.mode ?? 'append';

        if (mode === 'prepend') {
          state.items.unshift(item as never);
        } else if (mode === 'append') {
          state.items.push(item as never);
        }

        return state.items as D[];
      },

      removeItem(predicate: (item: D, index: number) => boolean) {
        const index = (state.items as D[]).findIndex(predicate);

        if (index !== -1) {
          state.items.splice(index, 1);
        }

        return index;
      },
    },
    items: params.items ?? [],
    limit: params.limit ?? 10,
    loading: params.loading ?? false,
    page: 1,
    row: params.row,
    search: params.search ?? '',
    total: params.total ?? 0,
  });

  return state as DataGrid<D>;
}
