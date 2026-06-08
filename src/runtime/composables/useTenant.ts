import { computed } from 'vue';
import { useState } from '#imports';

export const useTenant = () => {
  const tenant = useState<string>('tenant:id', () => '');
  const isReady = computed(() => Boolean(tenant.value));

  const setTenant = (value: string) => tenant.value = value;

  return {
    isReady,
    setTenant,
    tenant,
  };
};
