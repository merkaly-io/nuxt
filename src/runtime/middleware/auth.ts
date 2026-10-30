// middleware/auth.global.ts
import { defineNuxtRouteMiddleware, navigateTo, useRuntimeConfig, useState } from '#app';
import { useAuth } from '../composables/useAuth';

export default defineNuxtRouteMiddleware((to) => {
  const { isLoading, isAuthenticated } = useAuth();
  const isStarting = useState('auth:starting', () => false);
  const { public: { merkaly } } = useRuntimeConfig();
  const callbackPath = URL.canParse(merkaly.auth0.callbackUrl)
    ? new URL(merkaly.auth0.callbackUrl).pathname
    : merkaly.auth0.callbackUrl;

  // 1️⃣ No interferir mientras carga auth (la identidad ya resuelta, con el tenant
  // todavía en curso, sí se protege: es el mismo momento en que antes isLoading era false)
  if (isLoading.value && !isStarting.value) {
    return;
  }

  // 2️⃣ No proteger callback
  if (to.path === callbackPath) {
    return;
  }

  // 3️⃣ ¿La ruta requiere auth?
  const requiresAuth =
    typeof to.meta.requiresAuth === 'boolean'
      ? to.meta.requiresAuth
      : merkaly.auth0.requiresAuth;

  // 4️⃣ Si NO requiere auth, continuar
  if (!requiresAuth) {
    return;
  }

  // 5️⃣ Si no está autenticado → login
  if (isAuthenticated.value) {
    return;
  }

  const redirect = to.fullPath;
  const callbackUrl = redirect === '/'
    ? merkaly.auth0.callbackUrl
    : `${merkaly.auth0.callbackUrl}?redirect=${encodeURIComponent(redirect)}`;

  return navigateTo(callbackUrl);
});
