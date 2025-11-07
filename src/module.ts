import { defineNuxtModule, addPlugin, addImportsDir, createResolver } from '@nuxt/kit';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js';
import { defu } from 'defu';

export interface MerkalyModuleOptions {
  auth0: {
    client: string
    domain: string
    callback: string
    params?: Omit<ClientAuthorizationParams, 'redirect_uri'>
  };
  plausible: {
    domain: string,
    localhost: string,
  },
  baseUrl: string;
  baseUrlPrefix: string;
}

export default defineNuxtModule<MerkalyModuleOptions>({
  meta: {
    name: '@merkaly/nuxt',
    configKey: 'merkaly',
    compatibility: { nuxt: '>=3.0.0' },
  },

  defaults: {
    auth0: {
      client: '',
      domain: '',
      callback: '/callback',
    },
    plausible: {
      domain: '',
      localhost: '',
    },
    baseUrl: '/',
    baseUrlPrefix: '/',
  },

  moduleDependencies: {
    '@bootstrap-vue-next/nuxt': {},
    '@nuxt/eslint': {},
    '@nuxt/fonts': {},
    '@nuxt/image': {},
    '@nuxtjs/plausible': {},
    '@vueuse/nuxt': {},
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    /**
     * 🧩 1. Merge de configuración en runtimeConfig
     *    (esto permite acceder desde el plugin via useRuntimeConfig().public.merkaly)
     */
    nuxt.options.runtimeConfig.public.merkaly = defu(options, nuxt.options.runtimeConfig.public.merkaly || {});

    // 2️⃣ Configurar plausible
    nuxt.options.plausible = defu({
      apiHost: 'https://analytics.merkaly.io',
      domain: options.plausible.domain,
      enableAutoOutboundTracking: true,
      enableAutoPageviews: true,
      enabled: process.env.NODE_ENV === 'production', // ✅ Solo en producción
      ignoredHostnames: ['localhost'].concat(options.plausible.localhost).filter(Boolean),
    }, nuxt.options.plausible || {});

    // 3️⃣ Plugins
    addPlugin({ src: resolver.resolve('./runtime/plugins/api.global') });
    addPlugin({ src: resolver.resolve('./runtime/plugins/auth0.client'), mode: 'client' });

    // 4️⃣ Composables
    addImportsDir(resolver.resolve('./runtime/composables'));
  },
});
