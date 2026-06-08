import type { User } from '@auth0/auth0-spa-js';
import { computed } from 'vue';
import { useState } from '#imports';

export const useAuth = () => {
  const user = useState<User | undefined>('auth:user', () => undefined);
  const token = useState<string | null>('auth:token', () => null);
  const isLoading = useState('auth:loading', () => true);

  const isAuthenticated = computed(() => Boolean(user.value?.sub));

  return {
    isAuthenticated,
    isLoading,
    token,
    user,
  };
};
