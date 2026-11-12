import { computed, useNuxtApp } from '#imports';
import { runBootstrapStage, useBootstrapState } from '../internal/bootstrap';

export const useMe = <T = unknown>() => { // loaded after the organization, only when signed in
  const nuxtApp = useNuxtApp();
  const { data, error, status } = useBootstrapState<T>('me');

  const isReady = computed(() => status.value === 'success');

  const refresh = () => runBootstrapStage(nuxtApp, 'me', { force: true });

  return { data, error, isReady, refresh, status };
};
