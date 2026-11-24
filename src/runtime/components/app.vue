<script lang="ts" setup>
import { useRoute } from '#app';
import { computed } from 'vue';
import { useAuth, useOrganization, watchOnce, addRouteMiddleware, useNuxtApp, useRuntimeConfig } from '#imports';
import AuthMiddleware from '../middleware/auth';
import { useNavigation } from '../composables/useNavigation';
import AuthError from './auth/AuthError.vue';
import AuthExpired from './auth/AuthExpired.vue';
import { useColorMode } from '@vueuse/core';
import { defu } from 'defu';
import { Notivue, NotificationProgress, Notification, pastelTheme } from 'notivue';
import { useI18n } from 'vue-i18n';

const $route = useRoute();
const { clear, error, isLoading, logout, retry, switchOrganization } = useAuth();
const { fromServer } = useOrganization();
const { hook } = useNuxtApp();
const { public: $config } = useRuntimeConfig();

useColorMode({ attribute: 'data-bs-theme' });

const { t } = useI18n({ useScope: 'local' });

const defaults = computed(() => ({ BButton: { loadingText: t('loading') } })); // BootstrapVueNext texts in the app language

const keepAppDefaults = (app: object, module: object) => defu(app, module); // the app bootstrap.config wins

// Apps that need a login or a tenant wait for auth + tenant; public apps (www) and pages already
// resolved on the server (store) render right away, so their content and SEO reach the HTML
const waitsForAuth = $config.merkaly.auth0.requiresAuth || $config.merkaly.auth0.requiresTenant;
const blocking = computed(() => waitsForAuth && isLoading.value && !fromServer.value);

// Ejecutar middleware una sola vez cuando `isLoading` cambia
watchOnce(isLoading, () => AuthMiddleware($route, $route));

// Breadcrumb navigation management
const { defer, regenerate } = useNavigation();

addRouteMiddleware('navigation', (to) => defer(to), { global: true });

hook('page:finish', () => regenerate());
</script>

<template>
  <main>
    <NuxtLoadingIndicator color="var(--bs-primary)" :height="3" />

    <Notivue v-slot="item">
      <Notification :item="item" :theme="pastelTheme" title>
        <NotificationProgress :item="item" />
      </Notification>
    </Notivue>

    <BApp :defaults="defaults" :merge-defaults="keepAppDefaults">
      <slot v-if="blocking" name="loading" />

      <slot
          v-else-if="error"
          :clear="clear"
          :error="error"
          :logout="logout"
          :retry="retry"
          :switch-organization="switchOrganization"
          name="error"
      >
        <AuthError :error="error" @logout="logout" @retry="retry" @switch-organization="switchOrganization" />
      </slot>

      <slot v-else>
        <NuxtPage />
      </slot>

      <AuthExpired />
    </BApp>
  </main>
</template>

<i18n lang="json">
{
  "en": {
    "loading": "Loading..."
  },
  "es": {
    "loading": "Cargando..."
  },
  "pt": {
    "loading": "Carregando..."
  }
}
</i18n>

<style>
:root {
  --nv-z: 1090; /* toasts above Bootstrap sticky/fixed headers (1020/1030) and modals (1055), like .toast-container */
}
</style>
