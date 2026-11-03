import { computed } from 'vue';
import { useState } from '#imports';

export const useTenant = () => {
  const tenant = useState<string>('tenant:id', () => '');
  const fromServer = useState<boolean>('tenant:server', () => false); // resolved during SSR: the page renders before auth
  const isReady = computed(() => Boolean(tenant.value));

  const setTenant = (value: string, options: { server?: boolean } = {}) => {
    tenant.value = value;

    if (options.server) fromServer.value = true;
  };

  return {
    fromServer,
    isReady,
    setTenant,
    tenant,
  };
};
