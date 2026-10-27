import type { HookResult } from '@nuxt/schema';
import type { Auth0Client, User } from '@auth0/auth0-spa-js';
import type { ApiOptions } from '../plugins/api.global';
import type { AuthErrorContext } from '../composables/useAuth';

declare module '#app' {
  interface NuxtApp {
    $auth0: Auth0Client;
    $api: <T = unknown>(url: string, options?: ApiOptions) => Promise<T>;
    $gmap: never;
  }

  interface RuntimeNuxtHooks {
    'merkaly:auth': (user?: User) => HookResult;
    'merkaly:auth:error': (context: AuthErrorContext) => HookResult;
    'merkaly:auth:retry': () => HookResult;
    'merkaly:tenant': (user?: User) => HookResult;
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
