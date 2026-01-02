<script lang="ts" setup>
import { useNuxtApp, useRuntimeConfig, useRoute } from '#app';
import { onBeforeMount, useAuth, callOnce } from '#imports';
import { watchOnce } from '@vueuse/core';
import AuthMiddleware from '../middleware/auth';

const $route = useRoute();
const { $auth0 } = useNuxtApp();
const { public: { merkaly } } = useRuntimeConfig();
const { isLoading, isAuthenticated } = useAuth();

// Se ejecuta una sola vez cuando `isLoading` cambia (normalmente a false)
// Ideal para Auth0, ya que el estado de auth se resuelve de forma async
watchOnce(isLoading, () => AuthMiddleware($route, $route));

onBeforeMount(() => callOnce(() => $auth0.checkSession()));
</script>

<template>
  <main>
    <NuxtRouteAnnouncer />
    <BOrchestrator />

    <slot v-if="isLoading" name="loading" />

    <slot v-else>
      <NuxtPage />
    </slot>
  </main>
</template>
