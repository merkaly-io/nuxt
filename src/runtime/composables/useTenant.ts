import { computed } from 'vue';
import { useNuxtApp, useState } from '#imports';

let resolver: Promise<string | null> | null = null;

export const useTenant = () => {
  const { callHook } = useNuxtApp();

  const tenant = useState<string | null>('tenant:id', () => null);
  const isLoading = useState('tenant:loading', () => false);

  const isReady = computed(() => Boolean(tenant.value));

  const setTenant = (value: string) => tenant.value = value;

  const resolveTenant = async () => {
    if (tenant.value) return tenant.value;

    resolver ??= Promise.resolve()
      .then(() => {
        isLoading.value = true;

        return callHook('merkaly:tenant');
      })
      .then(() => tenant.value)
      .catch((reason) => {
        resolver = null;

        throw reason;
      })
      .finally(() => isLoading.value = false);

    return resolver;
  };

  return {
    isLoading,
    isReady,
    resolveTenant,
    setTenant,
    tenant,
  };
};
