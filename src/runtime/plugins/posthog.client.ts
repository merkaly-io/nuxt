import posthog from 'posthog-js';
import { watchImmediate } from '@vueuse/core';
import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import { useAuth } from '../composables/useAuth';

export default defineNuxtPlugin(() => {
  if (import.meta.dev) return; // production only

  const { public: $config } = useRuntimeConfig();

  if (!$config.merkaly.posthog) {
    console.warn('[posthog] merkaly.posthog is empty, analytics disabled'); // loud, not fatal
    return;
  }

  posthog.init($config.merkaly.posthog, {
    api_host: '/phog', // first-party proxy
    ui_host: 'https://eu.posthog.com',
  });

  const { user } = useAuth();

  watchImmediate(() => user.value?.sub, (sub, previous) => {
    if (sub) return posthog.identify(sub, { email: user.value?.email, name: user.value?.name }); // Auth0 id after login

    if (previous) posthog.reset(); // logout: back to an anonymous visitor
  });
});
