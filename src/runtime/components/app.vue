<script lang="ts" setup>
import { useRoute } from '#app';
import { useAuth, watchOnce } from '#imports';
import AuthMiddleware from '../middleware/auth';

const $route = useRoute();
const { isLoading } = useAuth();

// Ejecutar middleware una sola vez cuando `isLoading` cambia
watchOnce(isLoading, () => AuthMiddleware($route, $route));
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
