export interface FetchedPage<T> {
  items: T[];
  nextPage?: number | null; // `meta.pagination.nextPage` of the api
}

interface FetchAllPagesOptions {
  limit?: number; // page size per request
}

export async function fetchAllPages<T>(fetchPage: (query: { limit: number; page: number }) => Promise<FetchedPage<T>>, options: FetchAllPagesOptions = {}): Promise<T[]> { // walks the api pages until nextPage is null (exports)
  const limit = options.limit ?? 100;
  const items: T[] = [];
  let page: number | null | undefined = 1;

  while (page) {
    const result: FetchedPage<T> = await fetchPage({ limit, page });

    items.push(...result.items);
    page = result.items.length ? result.nextPage : null; // empty page: stop even if the api says otherwise
  }

  return items;
}
