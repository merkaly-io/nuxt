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
  addTemplate,
} from '@nuxt/kit';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { ClientAuthorizationParams } from '@auth0/auth0-spa-js';
import type { Nuxt } from '@nuxt/schema';
import { defu } from 'defu';
import { createJiti } from 'jiti';
import svgLoader from 'vite-svg-loader';
import 'reflect-metadata';

// @ts-expect-error Types aren't exposed but they exist
import type { BvnComponentProps } from 'bootstrap-vue-next';
import type { NotivueConfig } from 'notivue';
import type { Strategies } from '@nuxtjs/i18n';

// Re-export types for consumers
export type { AdapterOptions, AdapterArgs } from './runtime/utils/withAdapter';
export type { HooksOptions, ApiOptions, RefOptions, ParamsOptions } from './runtime/plugins/api.global';

type ModuleDependencies = Record<string, Record<string, unknown>>;
type Resolver = ReturnType<typeof createResolver>;
type Logger = ReturnType<typeof useLogger>;

export interface MerkalyI18nLocale {
  code: string;
  file: string;
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
    requiresTenant: boolean;
  };
  i18n?: {
    defaultLocale: string;
    locales: MerkalyI18nLocale[];
    /**
     * URL routing strategy. Defaults to `'no_prefix'` so existing projects keep
     * their current behavior (no locale segment in the URL). Set to a prefix
     * variant to expose a locale segment (e.g. `/es/about`) without translating
     * the route paths.
     */
    strategy?: Strategies;
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

const MODULE_NAME = '@merkaly/nuxt';
const MERKALY_ORG = 'merkaly';
const PLAUSIBLE_API_HOST = 'https://analytics.merkaly.io';
const FONT_AWESOME_KIT_URL = 'https://kit.fontawesome.com/55a4b2f4e1.js';

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
    requiresTenant: false,
  },
  i18n: {
    defaultLocale: 'en-US',
    locales: [],
    strategy: 'no_prefix',
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

function hasI18nConfig(options: MerkalyModuleOptions) {
  return Boolean(
    options.i18n?.defaultLocale &&
    options.i18n.locales.length > 0,
  );
}

function hasPlausibleConfig(options: MerkalyModuleOptions) {
  return Boolean(options.plausible?.domain);
}

function hasSentryBuildConfig(options: MerkalyModuleOptions) {
  return Boolean(options.sentry.project && options.sentry.token);
}

function resolveModuleOptions(nuxt: Nuxt): MerkalyModuleOptions {
  return defu(nuxt.options.merkaly || {}, defaultOptions) as MerkalyModuleOptions;
}

function buildModuleDependencies(nuxt: Nuxt, options: MerkalyModuleOptions): ModuleDependencies {
  const dependencies: ModuleDependencies = {
    '@bootstrap-vue-next/nuxt': {},
    '@nuxt/eslint': {},
    '@nuxt/fonts': {},
    '@nuxt/image': {},
    '@sentry/nuxt/module': {},
    '@vueuse/nuxt': {},
    'notivue/nuxt': {},
  };

  if (hasI18nConfig(options)) {
    dependencies['@nuxtjs/i18n'] = {
      overrides: configureI18n(nuxt, options),
    };
  }

  if (hasPlausibleConfig(options)) {
    dependencies['@nuxtjs/plausible'] = {};
  }

  const logger = useLogger(MODULE_NAME);

  Object.keys(dependencies).forEach(dependency => {
    logger.info(`Loaded ${dependency} module`);
  });

  return dependencies;
}

function configureI18n(nuxt: Nuxt, options: MerkalyModuleOptions) {
  if (!hasI18nConfig(options)) {
    return {};
  }

  const writeTemplate = (filename: string, contents: string) => {
    const template = addTemplate({
      filename,
      getContents: () => contents,
      write: true,
    });

    mkdirSync(dirname(template.dst), { recursive: true });
    writeFileSync(template.dst, contents);

    return template.dst;
  };

  nuxt.options.alias.i18n = resolve(nuxt.options.buildDir, 'i18n');

  const vueI18n = writeTemplate(
    'i18n/config.mjs',
    `export default defineI18nConfig(() => (${JSON.stringify({
      fallbackLocale: options.i18n!.defaultLocale,
      flatJson: true,
      legacy: false,
      locale: options.i18n!.defaultLocale,
    }, null, 2)}))\n`,
  );

  nuxt.hook('i18n:registerModule', register => {
    register({
      langDir: nuxt.options.rootDir,
      locales: options.i18n!.locales.map(locale => ({
        code: locale.code,
        file: locale.file,
        language: locale.language,
        name: locale.name,
      })),
    });
  });

  return {
    defaultLocale: options.i18n!.defaultLocale,
    detectBrowserLanguage: { useCookie: true },
    restructureDir: '.',
    strategy: options.i18n!.strategy ?? 'no_prefix',
    vueI18n,
  };
}

function configureRuntimeConfig(nuxt: Nuxt, options: MerkalyModuleOptions) {
  nuxt.options.runtimeConfig.merkaly = defu({
    sentry: {
      token: options.sentry.token,
    },
  }, nuxt.options.runtimeConfig.merkaly || {});

  nuxt.options.runtimeConfig.public.merkaly = defu({
      api: options.api,
      auth0: options.auth0,
      i18n: options.i18n,
      plausible: options.plausible,
      sentry: {
        dsn: options.sentry.dsn,
        project: options.sentry.project,
      },
    }, nuxt.options.runtimeConfig.public.merkaly || {},
  );
}

function configurePlausible(nuxt: Nuxt, options: MerkalyModuleOptions) {
  // @ts-expect-error Plausible module options aren't typed in Nuxt options
  nuxt.options.plausible = defu({
    apiHost: PLAUSIBLE_API_HOST,
    domain: options.plausible?.domain,
    enableAutoOutboundTracking: true,
    enableAutoPageviews: true,
    enabled: process.env.NODE_ENV === 'production' && hasPlausibleConfig(options),
    ignoredHostnames: ['localhost', options.plausible?.localhost].filter(Boolean),
    // @ts-expect-error Plausible module options aren't typed in Nuxt options
  }, nuxt.options.plausible || {});
}

function configureSentry(nuxt: Nuxt, options: MerkalyModuleOptions) {
  nuxt.options.sentry = defu({
    authToken: options.sentry.token,
    org: MERKALY_ORG,
    project: options.sentry.project,
  }, nuxt.options.sentry || {});

  nuxt.options.sourcemap = {
    client: 'hidden',
    server: true,
  };
}

function configureBootstrapVueNext(nuxt: Nuxt, components: BvnComponentProps) {
  nuxt.options.bootstrapVueNext = defu(nuxt.options.bootstrapVueNext || {},
    { plugin: { components } },
  );
}

function configureNotivue(nuxt: Nuxt) {
  nuxt.options.css.push('notivue/notification.css');
  nuxt.options.css.push('notivue/animations.css');
  nuxt.options.css.push('notivue/notification-progress.css');

  // @ts-expect-error Notivue module options aren't typed in Nuxt options
  nuxt.options.notivue = {
    centerOnMobile: true,
    clearOnSwipe: true,
    enqueue: true,
    fullWidth: false,
    limit: 3,
    pauseOnHover: true,
    position: 'top-right',
  } as NotivueConfig;
}

function configureFontAwesome(nuxt: Nuxt) {
  nuxt.options.app.head ||= {};
  nuxt.options.app.head.script ||= [];

  nuxt.options.app.head.script.push({
    crossorigin: 'anonymous',
    src: FONT_AWESOME_KIT_URL,
  });
}

function configureVite(nuxt: Nuxt) {
  nuxt.options.vite = defu(nuxt.options.vite || {}, {
    plugins: [svgLoader()],
    // Force a single shared notivue instance so consumers don't have to declare
    // `vite.resolve.dedupe: ['notivue']` themselves (avoids the duplicate-instance
    // `useNotivueInstance()` error, especially when @merkaly/nuxt is linked locally).
    resolve: {
      dedupe: ['notivue'],
    },
  });
}

function configureNuxtOptions(nuxt: Nuxt, options: MerkalyModuleOptions) {
  configureNotivue(nuxt);
  configureRuntimeConfig(nuxt, options);
  configurePlausible(nuxt, options);

  if (hasSentryBuildConfig(options)) {
    configureSentry(nuxt, options);
  }

  configureFontAwesome(nuxt);
  configureVite(nuxt);
}

function registerRuntimeFeatures(options: MerkalyModuleOptions, resolver: Resolver) {
  // Register Plugins
  addPlugin({ src: resolver.resolve('./runtime/plugins/api.global') });
  addPlugin({ src: resolver.resolve('./runtime/plugins/auth0.client') });
  addPlugin({ src: resolver.resolve('./runtime/plugins/sentry.global') });

  // Register Server Handlers
  addServerHandler({
    handler: resolver.resolve('./runtime/server/middleware/proxy'),
    middleware: true,
  });

  // Register Middlewares
  addRouteMiddleware({
    global: options.auth0.requiresAuth,
    name: 'auth',
    path: resolver.resolve('./runtime/middleware/auth'),
  });

  // Register AutoImports
  addImportsDir(resolver.resolve('./runtime/adapters'));
  addImportsDir(resolver.resolve('./runtime/composables'));
  addImportsDir(resolver.resolve('./runtime/utils'));

  // Register components
  addComponentsDir({
    path: resolver.resolve('./runtime/components'),
    prefix: 'MK',
  });

  // Register types
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

async function configureExternalIntegrations(
  nuxt: Nuxt,
  logger: Logger,
): Promise<void> {
  const bootstrapComponentsConfig = await loadBootstrapConfig(nuxt);

  if (Object.keys(bootstrapComponentsConfig).length > 0) {
    logger.success('Loading bootstrap.config.ts');
  }

  configureBootstrapVueNext(nuxt, bootstrapComponentsConfig);
}

export default defineNuxtModule<MerkalyModuleOptions>({
  defaults: defaultOptions,

  meta: {
    name: MODULE_NAME,
    configKey: 'merkaly',
    compatibility: {
      nuxt: '>=3.14.0',
    },
  },

  moduleDependencies(nuxt): ModuleDependencies {
    const options = resolveModuleOptions(nuxt);

    return buildModuleDependencies(nuxt, options);
  },

  async setup(options, nuxt): Promise<void> {
    const logger = useLogger(MODULE_NAME);
    const resolver = createResolver(import.meta.url);

    configureNuxtOptions(nuxt, options);
    await configureExternalIntegrations(nuxt, logger);
    registerRuntimeFeatures(options, resolver);
  },
});
