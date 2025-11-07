import { addPlugin, addImportsDir, defineNuxtModule, createResolver, useLogger } from '@nuxt/kit';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js';
import { defu } from 'defu';
import { existsSync } from 'node:fs';
import type { BvnComponentProps } from 'bootstrap-vue-next/dist/src/types/BootstrapVueOptions';

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
  defaults: {
    auth0: {
      client: '',
      domain: '',
      callback: '/auth',
    },
    plausible: {
      domain: '',
      localhost: '',
    },
    baseUrl: '/',
    baseUrlPrefix: '/',
  },

  meta: { name: '@merkaly/nuxt', configKey: 'merkaly', compatibility: { nuxt: '>=3.0.0' } },

  moduleDependencies: {
    '@bootstrap-vue-next/nuxt': {},
    '@nuxt/eslint': {},
    '@nuxt/fonts': {},
    '@nuxt/image': {},
    '@nuxtjs/plausible': {},
    '@vueuse/nuxt': {},
  },

  async setup(options, nuxt) {
    const $logger = useLogger('@merkaly/nuxt');
    const moduleResolver = createResolver(import.meta.url);
    const rootResolver = createResolver(nuxt.options.rootDir);

    /**
     * 🧩 1. Merge de configuración en runtimeConfig
     *    (esto permite acceder desde el plugin via useRuntimeConfig().public.merkaly)
     */
    nuxt.options.runtimeConfig.public.merkaly = defu(options, nuxt.options.runtimeConfig.public.merkaly || {});

    // 2️⃣ Configurar modulos
    nuxt.options.plausible = defu({
      apiHost: 'https://analytics.merkaly.io',
      domain: options.plausible.domain,
      enableAutoOutboundTracking: true,
      enableAutoPageviews: true,
      enabled: process.env.NODE_ENV === 'production', // ✅ Solo en producción
      ignoredHostnames: ['localhost'].concat(options.plausible.localhost).filter(Boolean),
    }, nuxt.options.plausible || {});

    const bootstrapConfigPath = rootResolver.resolve('bootstrap.config.ts');
    let bootstrapConfig: BvnComponentProps;

    if (existsSync(bootstrapConfigPath)) {
      bootstrapConfig = await import(bootstrapConfigPath) || {};
    }

    if (!bootstrapConfig) {
      $logger.warn('bootstrap.config.ts not found in root directory. Skipping');
      bootstrapConfig = {};
    }

    nuxt.options['bootstrapVueNext'] = defu((nuxt.options['bootstrapVueNext'] || {}), bootstrapConfig);

    // 3️⃣ Plugins
    addPlugin({ src: moduleResolver.resolve('./runtime/plugins/api.global') });
    addPlugin({ src: moduleResolver.resolve('./runtime/plugins/auth0.client'), mode: 'client' });

    // 4️⃣ Composables
    addImportsDir(moduleResolver.resolve('./runtime/composables'));
  },
});
