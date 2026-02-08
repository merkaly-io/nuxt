import { computed } from 'vue';
import { useState } from '#imports';
import type { RouteLocationNormalized } from 'vue-router';

// Interface for navigation item

/*
 * I prefer `null` instead `undefined` to avoid wrong usages,
 * null is when you don't want to show the Breadcrumb name
 * but you want to keep adding the URL to the breadcrumbs
 *
 * @see Project Pages
 */
interface INavigationItem {
  text: string | null;
  path: string;
  loading?: boolean;
}

type NavigationItemOrGetter = INavigationItem | (() => INavigationItem);

// Composition function to use navigation in components
export function useNavigation(page?: NavigationItemOrGetter) {
  // Reactive list of navigation items (stores getters or plain objects)
  const list = useState<NavigationItemOrGetter[]>('breadcrumbs', () => []);

  // Utility function to normalize paths and prevent repeated slashes
  function normalizePath(base: string, path: string): string {
    path = String(path);

    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    if (base.endsWith('/')) {
      base = base.slice(0, -1);
    }

    return base + path;
  }

  function resolve(item: NavigationItemOrGetter): INavigationItem {
    return typeof item === 'function' ? item() : item;
  }

  // All resolved items (unfiltered, used for current page)
  const all = computed(() => {
    let uri = '';

    return list.value.map((item) => {
      const { text, path, loading } = resolve(item);
      uri = normalizePath(uri, path);

      return { path: uri, text, loading: !!loading };
    });
  });

  // Filtered items for breadcrumb display (excludes loading and null text)
  const items = computed(() => {
    return all.value.filter(({ text, loading }) => text != null && !loading);
  });

  const current = computed(() => {
    return all.value.at(-1);
  });

  // Function to add a new page to the navigation list
  const setPage = (item: NavigationItemOrGetter) => {
    const { path } = resolve(item);
    const existingIndex = list.value.findIndex((i) => resolve(i).path === path);

    if (existingIndex >= 0) {
      list.value[existingIndex] = item;
      return;
    }

    return list.value.push(item);
  };

  // Auto-set page if provided as parameter
  if (page) {
    setPage(page);
  }

  // Function to regenerate the navigation list based on the current route
  function regenerate(route: RouteLocationNormalized) {
    const itemIndex = items.value.findLastIndex((value) => route.path.startsWith(value.path));

    if (itemIndex >= 0) {
      list.value = list.value.slice(0, itemIndex + 1);
      return;
    }

    list.value = [];
  }

  return { current, items, regenerate, setPage };
}
