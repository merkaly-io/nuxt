import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addRouteMiddleware,
  addServerHandler,
  addTypeTemplate,
  createResolver,
  defineNuxtModule,
  useLogger,
} from '@nuxt/kit';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js';
import type { Nuxt } from '@nuxt/schema';
import { defu } from 'defu';
import { createJiti } from 'jiti';
import { existsSync } from 'node:fs';
import svgLoader from 'vite-svg-loader';
import 'reflect-metadata';

// @ts-expect-error Types aren't exposed but they exist
import type { BvnComponentProps } from 'bootstrap-vue-next/dist/src/types/BootstrapVueOptions';

// Re-export types for consumers
export type { AdapterOptions, AdapterArgs } from './runtime/utils/withAdapter';
export type { HooksOptions, ApiOptions, RefOptions, ParamsOptions } from './runtime/plugins/api.global';

export interface MerkalyI18nLocale {
  code: string;
  config: Record<string, unknown>;
  language: string;
  name: string;
}

export interface MerkalyModuleOptions {
  api: {
    url: string;
    prefix?: string;
  };
  auth0: {
    audience: string;
    callbackUrl: string;
    client: string;
    domain: string;
    logoutUrl?: string;
    params?: Omit<ClientAuthorizationParams, 'redirect_uri'>;
    requiresAuth: boolean;
  };
  i18n?: {
    defaultLocale: string;
    locales: MerkalyI18nLocale[];
  };
  plausible?: {
    domain: string;
    localhost: string;
  };
  sentry: {
    dsn: string;
    project: string;
    token: string;
  };
}

const defaultOptions: MerkalyModuleOptions = {
  api: {
    url: '/',
    prefix: '/',
  },
  auth0: {
    audience: '',
    callbackUrl: '/auth',
    client: '',
    domain: '',
    logoutUrl: '/',
    params: {},
    requiresAuth: false,
  },
  i18n: {
    defaultLocale: 'en-US',
    locales: [],
  },
  plausible: {
    domain: '',
    localhost: '',
  },
  sentry: {
    dsn: '',
    project: '',
    token: '',
  },
};

function hasPlausibleConfig(options: MerkalyModuleOptions): boolean {
  return Boolean(options.plausible?.domain);
}

function buildModuleDependencies(options: MerkalyModuleOptions): Record<string, object> {
  const dependencies: Record<string, object> = {
    '@bootstrap-vue-next/nuxt': {},
    '@nuxt/eslint': {},
    '@nuxt/fonts': {},
    '@nuxt/image': {},
    '@nuxtjs/i18n': {},
    '@sentry/nuxt/module': {},
    '@vueuse/nuxt': {},
  };

  if (hasPlausibleConfig(options)) {
    dependencies['@nuxtjs/plausible'] = {};
  }

  const logger = useLogger('@merkaly/nuxt');

  Object.keys(dependencies).forEach(it => logger.info(`Loaded ${it} module`));

  return dependencies;
}

function configureRuntimeConfig(nuxt: Nuxt, options: MerkalyModuleOptions): void {
  nuxt.options.runtimeConfig.public.merkaly = defu(
    options,
    nuxt.options.runtimeConfig.public.merkaly || {},
  );
}

function configureI18n(nuxt: Nuxt, options: MerkalyModuleOptions): void {
  const hasI18nConfig = Boolean(options.i18n?.defaultLocale && options.i18n.locales.length > 0);

  if (!hasI18nConfig) return;

  const nuxtOptions = nuxt.options as typeof nuxt.options & {
    i18n?: Record<string, unknown>;
  };

  nuxtOptions.i18n = {
    defaultLocale: options.i18n!.defaultLocale,
    detectBrowserLanguage: { useCookie: true },
    locales: options.i18n!.locales.map(({ code, name, language }) => ({ code, name, language })),
    restructureDir: '.',
    strategy: 'no_prefix',
    vueI18n: {
      fallbackLocale: options.i18n!.defaultLocale,
      legacy: false,
      locale: options.i18n!.defaultLocale,
      messages: Object.fromEntries(options.i18n!.locales.map(locale => [locale.code, locale.config])),
    },
  };
}

function configurePlausible(nuxt: Nuxt, options: MerkalyModuleOptions): void {
  // @ts-expect-error plausible not defined
  nuxt.options.plausible = defu(
    {
      apiHost: 'https://analytics.merkaly.io',
      domain: options.plausible?.domain,
      enableAutoOutboundTracking: true,
      enableAutoPageviews: true,
      enabled: process.env.NODE_ENV === 'production' && hasPlausibleConfig(options),
      ignoredHostnames: ['localhost', options.plausible?.localhost].filter(Boolean),
    },

    // @ts-expect-error plausible not defined
    nuxt.options.plausible || {},
  );
}

function configureSentry(nuxt: Nuxt, options: MerkalyModuleOptions): void {
  nuxt.options.sentry = defu({
    authToken: options.sentry.token,
    org: 'merkaly',
    project: options.sentry.project,
  });

  nuxt.options.sourcemap = { client: 'hidden', server: true };
}

function configureBootstrapVueNext(nuxt: Nuxt, components: BvnComponentProps): void {
  nuxt.options.bootstrapVueNext = defu(
    nuxt.options.bootstrapVueNext || {},
    {
      plugin: {
        components,
      },
    },
  );
}

function configureAppHead(nuxt: Nuxt): void {
  nuxt.options.app?.head?.script?.push({
    crossorigin: 'anonymous',
    src: 'https://kit.fontawesome.com/55a4b2f4e1.js',
  });
}

function configureVite(nuxt: Nuxt): void {
  nuxt.options.vite = defu(
    nuxt.options.vite || {},
    {
      plugins: [svgLoader()],
    },
  );
}

function registerRuntimeFeatures(nuxt: Nuxt, options: MerkalyModuleOptions, resolver: ReturnType<typeof createResolver>): void {
  addPlugin({ src: resolver.resolve('./runtime/plugins/api.global') });
  addPlugin({ src: resolver.resolve('./runtime/plugins/auth0.client') });
  addPlugin({ src: resolver.resolve('./runtime/plugins/sentry.global') });

  addServerHandler({
    handler: resolver.resolve('./runtime/server/middleware/proxy'),
    middleware: true,
  });

  addRouteMiddleware({
    global: options.auth0.requiresAuth,
    name: 'auth',
    path: resolver.resolve('./runtime/middleware/auth'),
  });

  addImportsDir(resolver.resolve('./runtime/adapters'));
  addImportsDir(resolver.resolve('./runtime/composables'));
  addImportsDir(resolver.resolve('./runtime/utils'));

  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: 'MK',
  });

  addTypeTemplate({
    filename: 'types/merkaly.d.ts',
    src: resolver.resolve('./runtime/types/nuxt.d.ts'),
  });
}

async function loadBootstrapConfig(nuxt: Nuxt): Promise<BvnComponentProps> {
  const rootDirResolver = createResolver(nuxt.options.rootDir);
  const bootstrapConfigPath = rootDirResolver.resolve('bootstrap.config.ts');

  if (!existsSync(bootstrapConfigPath)) {
    return {};
  }

  const jiti = createJiti(import.meta.url);
  const imported = await jiti.import(bootstrapConfigPath).catch(() => ({}));

  return (imported as { default?: BvnComponentProps }).default || {};
}

export default defineNuxtModule<MerkalyModuleOptions>({
  defaults: defaultOptions,

  meta: {
    name: '@merkaly/nuxt',
    configKey: 'merkaly',
    compatibility: { nuxt: '>=3.14.0' },
  },

  moduleDependencies(nuxt): Record<string, object> {
    const options: MerkalyModuleOptions = defu(
      nuxt.options.merkaly || {},
      defaultOptions,
    );

    return buildModuleDependencies(options);
  },

  async setup(options, nuxt) {
    const logger = useLogger('@merkaly/nuxt');
    const resolver = createResolver(import.meta.url);

    configureRuntimeConfig(nuxt, options);
    configureI18n(nuxt, options);
    configurePlausible(nuxt, options);
    configureSentry(nuxt, options);

    const bootstrapComponentsConfig = await loadBootstrapConfig(nuxt);

    if (Object.keys(bootstrapComponentsConfig).length > 0) {
      logger.success('Loading bootstrap.config.ts');
    }

    configureBootstrapVueNext(nuxt, bootstrapComponentsConfig);
    configureAppHead(nuxt);
    registerRuntimeFeatures(nuxt, options, resolver);
    configureVite(nuxt);
  },
});
