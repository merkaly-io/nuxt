import { defineNuxtModule, addPlugin, addImportsDir, createResolver } from '@nuxt/kit';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js';

export interface MerkalyModuleOptions {
  auth0: {
    client: string
    domain: string
    callback: string
    params?: Omit<ClientAuthorizationParams, 'redirect_uri'>
  };
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
    nuxt.options.runtimeConfig.public.merkaly = {
      ...(nuxt.options.runtimeConfig.public.merkaly || {}),
      ...options,
    };

    /**
     * 🧩 2. Plugins
     *    Usa addPlugin({ src, mode }) en lugar de addPlugin(src)
     *    porque es más explícito y mantiene tipado correcto.
     */
    addPlugin({ src: resolver.resolve('./runtime/plugins/api.global') });

    addPlugin({ src: resolver.resolve('./runtime/plugins/auth0.client'), mode: 'client' });

    /**
     * 🧩 3. Composables (auto-imports)
     */
    addImportsDir(resolver.resolve('./runtime/composables'));
  },
});
