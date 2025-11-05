import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';

// Module options TypeScript interface definition
export interface MerkalyModuleOptions {
  auth0ClientId?: string;
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

  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url);

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolver.resolve('./runtime/plugin'));
  },
});
