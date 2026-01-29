import { useState, computed } from '#imports';
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
}

// Composition function to use navigation in components
export function useNavigation(page?: INavigationItem) {
  // Reactive list of navigation items
  const list = useState<INavigationItem[]>('breadcrumbs', () => []);

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

  // Computed property for navigation items with full path and text
  const items = computed(() => {
    let uri = '';

    return list.value
      .map(({ text, path }) => {
        uri = normalizePath(uri, path);

        return { path: uri, text };
      })
      .filter(({ text }) => text !== null); // Exclude items with null as text
  });

  const current = computed(() => {
    const length = items.value.length;

    return items.value.at(length - 1);
  });

  // Function to add a new page to the navigation list
  const setPage = (item: INavigationItem) => {
    const newItem = JSON.stringify(item);
    const existingItems = list.value.map((item) => JSON.stringify(item));

    if (existingItems.includes(newItem)) {
      // New breadcrumb found in existing breadcrumbs, skip adding it to the array
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
