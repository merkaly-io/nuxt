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

  // Shared pending route for deferred regeneration (avoids flicker during navigation)
  const pendingRoute = useState<string | null>('breadcrumbs:pending', () => null);

  // Apply deferred trim based on pending route
  function flushRegenerate() {
    if (!pendingRoute.value) return;

    const route = pendingRoute.value;
    pendingRoute.value = null;

    const itemIndex = all.value.findLastIndex((value) => route.startsWith(value.path));

    if (itemIndex >= 0) {
      list.value = list.value.slice(0, itemIndex + 1);
      return;
    }

    list.value = [];
  }

  // Register page if provided
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

  // Store the target route for deferred regeneration
  function regenerate(route: RouteLocationNormalized) {
    pendingRoute.value = route.path;
  }

  return { current, items, regenerate, flushRegenerate };
}
