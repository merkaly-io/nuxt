import { useOffsetPagination } from '@vueuse/core';
import { computed, reactive, ref, watch } from 'vue';

export interface PaginationMeta {
  pagination?: { nextPage?: number | null; totalItems?: number };
}

export interface PaginationQuery {
  limit: number;
  page: number;
}

export interface Pagination {
  limit: number;
  page: number;
  total: number;
  readonly isFirstPage: boolean;
  readonly isLastPage: boolean;
  readonly pages: number;
  readonly query: PaginationQuery;
  next: () => void;
  onChange: (callback: () => unknown) => void;
  prev: () => void;
  resetPage: () => void;
  setTotal: (meta?: PaginationMeta) => void;
}

interface PaginationOptions {
  limit?: number;
  page?: number;
}

export function usePagination(options: PaginationOptions = {}): Pagination { // useOffsetPagination + what the api lists need
  const known = ref<number | null>(null); // null until the api answers: no clamping (a ?page=3 from the url survives)
  const total = computed({ get: () => known.value ?? 0, set: value => void (known.value = value) });

  const offset = useOffsetPagination({ page: options.page ?? 1, pageSize: options.limit ?? 10, total: () => known.value ?? Number.POSITIVE_INFINITY }); // clamps the page once the total is known

  const callbacks: Array<() => unknown> = []; // registered with onChange

  const query = computed<PaginationQuery>(() => ({ limit: offset.currentPageSize.value, page: offset.currentPage.value })); // the `pagination` param of the api

  return reactive({
    isFirstPage: offset.isFirstPage,
    isLastPage: offset.isLastPage,
    limit: offset.currentPageSize,
    next: offset.next,
    onChange: (callback: () => unknown) => {
      callbacks.push(callback);
      watch(query, () => callback()); // one call per change, page and limit together
    },
    page: offset.currentPage,
    pages: computed(() => known.value === null ? 1 : offset.pageCount.value), // 1 until the total is known
    prev: offset.prev,
    query,
    resetPage: () => offset.currentPage.value === 1 ? callbacks.forEach(callback => callback()) : void (offset.currentPage.value = 1), // filter changes: one fetch, on page 1
    setTotal: (meta?: PaginationMeta) => void (total.value = meta?.pagination?.totalItems ?? 0),
    total,
  }) as Pagination;
}
