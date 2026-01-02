import { defineNuxtRouteMiddleware, useNuxtApp, useRuntimeConfig } from '#app';
import { useAuth } from '#imports';

export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoading, isAuthenticated } = useAuth();
  const { $auth0 } = useNuxtApp();
  const { public: { merkaly } } = useRuntimeConfig();

  // 1️⃣ Nunca interceptar la callback
  if (location.pathname === merkaly.auth0.callbackUrl) {
    return;
  }

  // 2️⃣ Esperar a Auth0
  if (isLoading.value) {
    return;
  }

  // 3️⃣ Si ya está autenticado, continuar
  if (isAuthenticated.value) {
    return;
  }

  // 4️⃣ Decidir si la ruta requiere auth
  const requiresAuth =
    typeof to.meta.requiresAuth === 'boolean'
      ? to.meta.requiresAuth
      : merkaly.auth0.requiresAuth;

  // 5️⃣ Si NO requiere auth, continuar
  if (!requiresAuth) {
    return;
  }

  return location.href = merkaly.auth0.callbackUrl;
});
