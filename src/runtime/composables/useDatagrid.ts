import { reactive } from 'vue';

export interface ColumnDefinition<C = unknown> {
  class?: string;
  getter?: (row: C) => any;
  tdClass?: string;
  thClass?: string;
  title?: string;
  type?: any;
}

export type DataGridItem<C> = C;

export interface DataGrid<C = unknown> {
  columns: Record<string, ColumnDefinition<C>>;
  error: unknown;
  fn: {
    addItem: (item: C) => DataGridItem<C>[];
    removeItem: (predicate: (item: DataGridItem<C>, index: number) => boolean) => number;
  };
  items: DataGridItem<C>[];
  limit: number;
  loading: boolean;
  page: number;
  rowAttrs: (item: C) => Record<string, unknown>;
  search: string;
  total: number;
}

interface OptionArgs<D> {
  columns: Record<string, ColumnDefinition<D>>;
  error?: unknown;
  items?: D[];
  limit?: number;
  loading?: boolean;
  rowAttrs?: (item: D) => Record<string, unknown>;
  search?: string;
  total?: number;
}

export function useDatagrid<D = unknown>(params: OptionArgs<D>): DataGrid<D> {
  const state = reactive({
    columns: params.columns,
    error: params.error ?? null,
    fn: {
      addItem(item: D) {
        state.items.push(item as never);
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
    rowAttrs: params.rowAttrs,
    search: params.search,
    total: params.total ?? 0,
  });

  return state as DataGrid<D>;
}
