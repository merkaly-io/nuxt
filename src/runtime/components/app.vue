<script lang="ts" setup>
import { useRoute } from '#app';
import { useAuth, watchOnce, addRouteMiddleware, useNuxtApp } from '#imports';
import AuthMiddleware from '../middleware/auth';
import { useNavigation } from '../composables/useNavigation';

const $route = useRoute();
const { isLoading } = useAuth();
const { hook } = useNuxtApp();

// Ejecutar middleware una sola vez cuando `isLoading` cambia
watchOnce(isLoading, () => AuthMiddleware($route, $route));

// Breadcrumb navigation management
const { defer, regenerate } = useNavigation();

addRouteMiddleware('navigation', (to) => defer(to), { global: true });
hook('page:finish', () => regenerate());
</script>

<template>
  <main>
    <NuxtRouteAnnouncer />
    <BOrchestrator />

    <!-- Mostramos spinner mientras auth se carga -->
    <slot v-if="isLoading" name="loading" />

    <!-- Renderizamos páginas solo cuando isLoading = false -->
    <slot v-else>
      <NuxtPage />
    </slot>
  </main>
</template>
