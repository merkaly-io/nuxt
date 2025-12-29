<script lang="ts" setup>
import { useNuxtApp, useRuntimeConfig, useRoute } from '#app';
import { onBeforeMount, useAuth, callOnce, ref } from '#imports';
import { watchOnce } from '@vueuse/core';

const { $auth0 } = useNuxtApp();
const $route = useRoute();
const { public: { merkaly } } = useRuntimeConfig();
const { isLoading, isAuthenticated } = useAuth();

onBeforeMount(() => callOnce(() => $auth0.checkSession()));

const isReady = ref(true);

// Se ejecuta una sola vez cuando `isLoading` cambia (normalmente a false)
// Ideal para Auth0, ya que el estado de auth se resuelve de forma async
watchOnce(isLoading, () => {
  // Si la ruta no requiere autenticación, no hacemos nada
  if (!merkaly.auth0.requiresAuth) {
    return;
  }

  // Si el usuario ya está autenticado, dejamos continuar
  if (isAuthenticated.value) {
    return;
  }

  // Evita loop infinito cuando Auth0 redirige de vuelta al callback
  if (merkaly.auth0.callbackUrl === $route.path) {
    return;
  }

  // Marca la app como no lista antes de redirigir
  // (útil para loaders globales / layouts)
  isReady.value = false;

  // Redirige a Auth0 para iniciar el flujo de login
  return $auth0.loginWithRedirect();
});
</script>

<template>
  <main>
    <NuxtRouteAnnouncer />
    <BOrchestrator />

    <slot v-if="isLoading" name="loading" />

    <slot v-else-if="isReady">
      <NuxtPage />
    </slot>
  </main>
</template>
