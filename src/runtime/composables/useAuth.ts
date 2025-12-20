import type { User } from '@auth0/auth0-spa-js';
import { useState, computed } from '#imports';

export const useAuth = () => {
  const user = useState<User | null>('user', () => null);
  const tenant = useState<string | null>('tenant', () => null);
  const token = useState<string | null>('token', () => null);
  const isLoading = useState('isLoading', () => true);

  const isAuthenticated = computed(() => Boolean(user.value?.sub));

  return {
    tenant,
    isAuthenticated,
    isLoading,
    token,
    user,
  };
};
