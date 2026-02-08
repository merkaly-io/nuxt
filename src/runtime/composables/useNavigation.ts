import { computed } from 'vue';
import { useState } from '#imports';

interface NavigationItem {
  text: string | null;
  path: string;
  loading?: boolean;
}

type NavigationItemOrGetter = NavigationItem | (() => NavigationItem);

export function useNavigation(page?: NavigationItemOrGetter) {
  const list = useState<NavigationItemOrGetter[]>('breadcrumbs', () => []);
  const pendingRoute = useState<string | null>('breadcrumbs:pending', () => null);

  function normalizePath(base: string, path: string): string {
    return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  function resolve(item: NavigationItemOrGetter): NavigationItem {
    return typeof item === 'function' ? item() : item;
  }

  const resolved = computed(() => {
    let uri = '';

    return list.value.map((item) => {
      const { text, path, loading } = resolve(item);
      uri = normalizePath(uri, path);

      return { path: uri, text, loading: !!loading };
    });
  });

  const items = computed(() => {
    return resolved.value.filter(({ text, loading }) => text != null && !loading);
  });

  const current = computed(() => {
    return resolved.value.at(-1);
  });

  function flushRegenerate() {
    if (!pendingRoute.value) return;

    const route = pendingRoute.value;
    pendingRoute.value = null;

    const itemIndex = resolved.value.findLastIndex((value) => route.startsWith(value.path));

    if (itemIndex >= 0) {
      list.value = list.value.slice(0, itemIndex + 1);
      return;
    }

    list.value = [];
  }

  if (page) {
    flushRegenerate();

    const { path } = resolve(page);
    const existingIndex = list.value.findIndex((i) => resolve(i).path === path);

    if (existingIndex >= 0) {
      list.value[existingIndex] = page;
    } else {
      list.value.push(page);
    }
  }

  function regenerate(route: { path: string }) {
    pendingRoute.value = route.path;
  }

  return { current, items, regenerate, flushRegenerate };
}
