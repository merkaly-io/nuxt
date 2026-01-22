import {
  addPlugin,
  addImportsDir,
  addRouteMiddleware,
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  useLogger,
} from '@nuxt/kit';
import { createJiti } from 'jiti';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js';
import { defu } from 'defu';
import { existsSync } from 'node:fs';
import svgLoader from 'vite-svg-loader';

// @ts-expect-error Types aren't exposed but they exists
import type { BvnComponentProps } from 'bootstrap-vue-next/dist/src/types/BootstrapVueOptions';

// Re-export types for consumers
export type { AdapterOptions, AdapterArgs } from './runtime/utils/withAdapter';
export type { HooksOptions, ApiOptions, RefOptions, ParamsOptions } from './runtime/plugins/api.global';

export interface MerkalyModuleOptions {
  auth0: {
    audience: string
    callbackUrl: string
    client: string
    domain: string
    logoutUrl?: string
    params?: Omit<ClientAuthorizationParams, 'redirect_uri'>
    requiresAuth: boolean
  };
  plausible?: {
    domain: string,
    localhost: string,
  },
  api: {
    url: string;
    prefix?: string;
  };
}

export default defineNuxtModule<MerkalyModuleOptions>({
  defaults: {
    auth0: {
      audience: '',
      callbackUrl: '/auth',
      client: '',
      domain: '',
      logoutUrl: '/',
      params: {},
      requiresAuth: false,
    },
    plausible: {
      domain: '',
      localhost: '',
    },
    api: {
      url: '/',
      prefix: '/',
    },
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
    const moduleResolver = createResolver(import.meta.url);
    const rootResolver = createResolver(nuxt.options.rootDir);

    /**
     * 🧩 1. Merge de configuración en runtimeConfig
     *    (esto permite acceder desde el plugin via useRuntimeConfig().public.merkaly)
     */
    nuxt.options.runtimeConfig.public.merkaly = defu(options, nuxt.options.runtimeConfig.public.merkaly || {});

    // Configurar modulos
    nuxt.options.plausible = defu({
      apiHost: 'https://analytics.merkaly.io',
      domain: options.plausible?.domain,
      enableAutoOutboundTracking: true,
      enableAutoPageviews: true,
      enabled: process.env.NODE_ENV === 'production', // ✅ Solo en producción
      ignoredHostnames: ['localhost'].concat(options.plausible?.localhost || '').filter(Boolean),
    }, nuxt.options.plausible || {});

    const logger = useLogger('@merkaly/nuxt');
    const bootstrapConfigPath = rootResolver.resolve('bootstrap.config.ts');

    logger.info(`Loading bootstrap.config.ts from: ${bootstrapConfigPath} (exists: ${existsSync(bootstrapConfigPath)})`);

    const jiti = createJiti(import.meta.url);
    const BootstrapConfig: BvnComponentProps = await jiti.import(bootstrapConfigPath)
      .then((m) => (m as { default?: BvnComponentProps }).default || {})
      .catch((err: Error) => {
        logger.error(`Failed to load bootstrap.config.ts:`, err.message);
        return {};
      });

    logger.info(`Bootstrap config keys: ${Object.keys(BootstrapConfig).join(', ') || '(empty)'}`)

    nuxt.options['bootstrapVueNext'] = defu((nuxt.options['bootstrapVueNext'] || {}), { plugin: { components: BootstrapConfig } });

    // Plugins
    addPlugin({ src: moduleResolver.resolve('./runtime/plugins/api.global') });
    addPlugin({ src: moduleResolver.resolve('./runtime/plugins/auth0.client'), mode: 'client' });

    // Middlewares
    addRouteMiddleware({
      global: options.auth0.requiresAuth,
      name: 'auth',
      path: moduleResolver.resolve('./runtime/middleware/auth'),
    });

    // Composables
    addImportsDir(moduleResolver.resolve('./runtime/composables'));
    addImportsDir(moduleResolver.resolve('./runtime/utils'));

    addComponentsDir({
      path: moduleResolver.resolve('./runtime/components'),
      prefix: 'MK',
    });

    nuxt.options['vite'] = defu((nuxt.options['vite'] || {}), { plugins: [svgLoader()] });
  },
});
