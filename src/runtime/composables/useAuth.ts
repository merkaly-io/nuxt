import type { User } from '@auth0/auth0-spa-js';
import { computed } from 'vue';
import { useNuxtApp, useState } from '#imports';

export type AuthErrorStage = 'callback' | 'token' | 'session' | 'tenant';

export interface AuthError {
  message: string;
  stage: AuthErrorStage;
  status?: number;
  url?: string;
}

export interface AuthErrorContext {
  clear: () => void;
  error: AuthError;
  logout: () => Promise<void>;
  retry: () => Promise<void>;
}

export const useAuth = () => {
  const nuxtApp = useNuxtApp();

  const user = useState<User | undefined>('auth:user', () => undefined);
  const token = useState<string | null>('auth:token', () => null);
  const isLoading = useState('auth:loading', () => true);
  const error = useState<AuthError | undefined>('auth:error', () => undefined);

  const isAuthenticated = computed(() => Boolean(user.value?.sub));

  const clear = () => (error.value = undefined);

  const logout = () => nuxtApp.$auth0.logout();

  // Re-runs the auth bootstrap (token + tenant/auth hooks) registered by the auth0 plugin
  const retry = async () => {
    clear();

    await nuxtApp.callHook('merkaly:auth:retry');
  };

  // Records an auth bootstrap failure instead of logging the user out: MKApp renders
  // the error slot and each app decides what to do next in `merkaly:auth:error`
  const fail = async (reason: AuthError) => {
    error.value = reason;

    console.error(`[Auth] ${reason.stage} failed`, reason);

    await nuxtApp.callHook('merkaly:auth:error', { clear, error: reason, logout, retry });
  };

  return {
    clear,
    error,
    fail,
    isAuthenticated,
    isLoading,
    logout,
    retry,
    token,
    user,
  };
};
