import { computed, useNuxtApp, useState } from '#imports';
import { useBootstrapStage } from '../internal/state';

export const useOrganization = () => { // id (tenant) plus the data loaded by defineBootstrap
  const id = useState<string>('merkaly:organization:id', () => '');
  const fromServer = useState<boolean>('merkaly:organization:server', () => false); // resolved during SSR: the page renders before auth
  const stage = useBootstrapStage(useNuxtApp(), 'organization');

  const hasId = computed(() => Boolean(id.value));

  const setId = (value: string, options: { server?: boolean } = {}) => {
    id.value = value;

    if (options.server) fromServer.value = true;
  };

  return { ...stage, fromServer, hasId, id, setId };
};
