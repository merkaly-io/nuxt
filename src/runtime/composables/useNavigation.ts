import { computed } from 'vue';
import { useState } from '#imports';

interface NavigationItem {
  disabled?: boolean;
  loading?: boolean;
  path: string;
  text: string | null;
}

type NavigationItemOrGetter = NavigationItem | (() => NavigationItem);

export function useNavigation(page?: NavigationItemOrGetter) {
  const list = useState<NavigationItemOrGetter[]>('breadcrumbs', () => []);
  const pendingRoute = useState<string | null>('breadcrumbs:pending', () => null);

  /* ----------------------------- helpers ----------------------------- */

  const resolveItem = (item: NavigationItemOrGetter): NavigationItem =>
    typeof item === 'function' ? item() : item;

  const normalizePath = (base: string, path: string): string =>
    `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

  const isVisibleItem = (item: NavigationItem) => item.text != null && !item.loading;

  /* ---------------------------- computed ----------------------------- */

  const resolved = computed<NavigationItem[]>(() => {
    let uri = '';

    return list.value.map((rawItem) => {
      const item = resolveItem(rawItem);

      uri = normalizePath(uri, item.path ?? '');

      return {
        disabled: item.disabled,
        loading: !!item.loading,
        path: uri,
        text: item.text,
      };
    });
  });

  const items = computed(() => resolved.value.filter(isVisibleItem));

  const current = computed(() => resolved.value.at(-1));

  /* --------------------------- mutations ----------------------------- */

  function regenerate() {
    if (!pendingRoute.value) return;

    const route = pendingRoute.value;
    pendingRoute.value = null;

    const index = findLastMatchingIndex(route);

    list.value = index >= 0
      ? list.value.slice(0, index + 1)
      : [];
  }

  function defer(route: { path: string }) {
    pendingRoute.value = route.path;
  }

  function findLastMatchingIndex(route: string): number {
    return resolved.value.findLastIndex((item) =>
      route.startsWith(item.path),
    );
  }

  function upsertPage(page: NavigationItemOrGetter) {
    const { path } = resolveItem(page);

    const index = list.value.findIndex(
      (item) => resolveItem(item).path === path,
    );

    if (index >= 0) {
      list.value[index] = page;
      return;
    }

    list.value.push(page);
  }

  /* --------------------------- bootstrap ----------------------------- */

  if (!page) {
    return { current, items, defer, regenerate };
  }

  regenerate();
  upsertPage(page);

  return { current, items, defer, regenerate };
}
