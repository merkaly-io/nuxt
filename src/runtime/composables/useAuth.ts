import type { RedirectLoginOptions, User } from '@auth0/auth0-spa-js';
import { useNuxtApp, useState, computed } from '#imports';

export const useAuth = () => {
  const { $auth0 } = useNuxtApp();

  const user = useState<User | null>('user', () => null);
  const identity = useState<string | null>('identity', () => null);
  const token = useState<string | null>('token', () => null);
  const isLoading = useState('isLoading', () => true);

  const isAuthenticated = computed(() => Boolean(user.value?._id && token.value));

  const login = async (options?: RedirectLoginOptions['authorizationParams']) => {
    return $auth0.loginWithRedirect({ authorizationParams: options });
  };

  const logout = async () => {
    return $auth0.logout();
  };

  return {
    identity,
    isAuthenticated,
    isLoading,
    login,
    logout,
    token,
    user,
  };
};
