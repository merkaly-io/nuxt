import { computed, useNuxtApp } from '#imports';
import { runBootstrapStage, useBootstrapState } from '../internal/bootstrap';

export const useOrganization = <T = unknown>() => { // shared state loaded by defineBootstrap
  const nuxtApp = useNuxtApp();
  const { data, error, status } = useBootstrapState<T>('organization');

  const isReady = computed(() => status.value === 'success');

  const refresh = () => runBootstrapStage(nuxtApp, 'organization', { force: true }); // e.g. after saving the settings

  return { data, error, isReady, refresh, status };
};
