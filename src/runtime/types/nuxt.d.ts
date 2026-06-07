import type { HookResult } from '@nuxt/schema';
import type { Auth0Client, User } from '@auth0/auth0-spa-js';
import type { ApiOptions } from '../plugins/api.global';

declare module '#app' {
  interface NuxtApp {
    $auth0: Auth0Client;
    $api: <T = unknown>(url: string, options?: ApiOptions) => Promise<T>;
    $gmap: never;
  }

  interface RuntimeNuxtHooks {
    'merkaly:auth': (user: User | null) => HookResult;
    'merkaly:tenant': () => HookResult;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth0: Auth0Client;
    $api: <T = unknown>(url: string, options?: ApiOptions) => Promise<T>;
    $gmap: never;
  }
}

export {};
