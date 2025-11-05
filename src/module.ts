import { defineNuxtModule, addPlugin, createResolver, addImportsDir } from '@nuxt/kit';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js';

// Module options TypeScript interface definition
export interface MerkalyModuleOptions {
  auth0: {
    client: string;
    domain: string;
    callback: string;
    params?: Omit<ClientAuthorizationParams, 'redirect_uri'>
  };
}

export default defineNuxtModule<MerkalyModuleOptions>({
  defaults: {},
  // Default configuration options of the Nuxt module
  meta: {
    compatibility: { nuxt: '>=3.0.0' },
    configKey: 'merkaly',
    name: '@merkaly/nuxt',
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
    // Guardar las opciones del módulo dentro del runtimeConfig
    nuxt.options.runtimeConfig.public.merkaly = {
      ...(nuxt.options.runtimeConfig.public.merkaly || {}),
      ...options,
    };

    const resolver = createResolver(import.meta.url);

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugins/auth0.client'));

    addImportsDir(resolver.resolve('./runtime/composables'));
  },
});
