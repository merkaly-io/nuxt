<script lang="ts" setup>
import { useRoute } from '#app';
import { useAuth, watchOnce, addRouteMiddleware, useNuxtApp } from '#imports';
import AuthMiddleware from '../middleware/auth';
import { useNavigation } from '../composables/useNavigation';
import { useColorMode } from '@vueuse/core';

const $route = useRoute();
const { isLoading } = useAuth();
const { hook } = useNuxtApp();

useColorMode({ attribute: 'data-bs-theme' });

// Ejecutar middleware una sola vez cuando `isLoading` cambia
watchOnce(isLoading, () => AuthMiddleware($route, $route));

// Breadcrumb navigation management
const { defer, regenerate } = useNavigation();

addRouteMiddleware('navigation', (to) => defer(to), { global: true });

hook('page:finish', () => regenerate());
</script>

<template>
  <main>
    <BApp>
      <!-- Mostramos spinner mientras auth se carga -->
      <slot v-if="isLoading" name="loading" />

      <!-- Renderizamos páginas solo cuando isLoading = false -->
      <slot v-else>
        <NuxtPage />
      </slot>
    </BApp>
  </main>
</template>
