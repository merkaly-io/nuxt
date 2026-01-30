import type { User } from '@auth0/auth0-spa-js';
import { computed } from 'vue';
import { useState } from '#imports';

export const useAuth = () => {
  const user = useState<User | null>('auth:user', () => null);
  const token = useState<string | null>('auth:token', () => null);
  const isLoading = useState('auth:loading', () => true);
  const tenant = computed(() => user.value?.org_id);

  const isAuthenticated = computed(() => Boolean(user.value?.sub));

  return {
    isAuthenticated,
    isLoading,
    tenant,
    token,
    user,
  };
};
