import { defineNuxtRouteMiddleware, useNuxtApp, useRuntimeConfig } from '#app';
import { useAuth } from '#imports';

export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { $auth0 } = useNuxtApp();
  const { public: { merkaly } } = useRuntimeConfig();

  if (isLoading.value) {
    return;
  }

  if (isAuthenticated.value) {
    return;
  }

  return location.href = merkaly.auth0.callbackUrl;
});
