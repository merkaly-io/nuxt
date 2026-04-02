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

function configurePlausible(nuxt: Nuxt, options: MerkalyModuleOptions): void {
  nuxt.options.plausible = defu(
    {
      apiHost: 'https://analytics.merkaly.io',
      domain: options.plausible?.domain,
      enableAutoOutboundTracking: true,
      enableAutoPageviews: true,
      enabled: process.env.NODE_ENV === 'production' && hasPlausibleConfig(options),
      ignoredHostnames: ['localhost', options.plausible?.localhost].filter(Boolean),
    },
    nuxt.options.plausible || {},
  );
}

function configureSentry(nuxt: Nuxt, options: MerkalyModuleOptions): void {
  nuxt.options.sentry = defu({
    authToken: options.sentry.token,
    org: 'merkaly',
    project: options.sentry.project,
  });

  nuxt.options.sourcemap = { client: 'hidden' };
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

function configureVite(nuxt: Nuxt): void {
  nuxt.options.vite = defu(
    nuxt.options.vite || {},
    {
      plugins: [svgLoader()],
    },
  );
}

const merkalyModule = defineNuxtModule<MerkalyModuleOptions>({
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
    configurePlausible(nuxt, options);
    configureSentry(nuxt, options);

    const bootstrapComponentsConfig = await loadBootstrapConfig(nuxt);

    if (Object.keys(bootstrapComponentsConfig).length > 0) {
      logger.info('Loading bootstrap.config.ts');
    }

    configureBootstrapVueNext(nuxt, bootstrapComponentsConfig);
    registerRuntimeFeatures(nuxt, options, resolver);
    configureVite(nuxt);
  },
});

export default merkalyModule;
