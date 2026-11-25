import type { HookResult } from '@nuxt/schema';
import type { Auth0Client, User } from '@auth0/auth0-spa-js';
import type { ApiOptions, ApiStreamOptions, ApiStreamResponse } from '../plugins/api.global';
import type { AuthErrorContext } from '../composables/useAuth';

type MerkalyApi = {
  <T = unknown>(url: string, options?: ApiOptions): Promise<T | undefined>; // undefined when the request fails
  stream(url: string, options?: ApiStreamOptions): Promise<ApiStreamResponse | undefined>; // undefined without a response
};

type MerkalyAuth0Client = Auth0Client & {
  linkWithConnection: (connection: string) => Promise<unknown>; // added by the auth0 plugin
};

declare module '#app' {
  interface NuxtApp {
    $auth0: MerkalyAuth0Client;
    $api: MerkalyApi;
    $gmap: never;
  }

  interface RuntimeNuxtHooks {
    'merkaly:auth': (claims?: User) => HookResult;
    'merkaly:auth:error': (context: AuthErrorContext) => HookResult;
    'merkaly:auth:retry': () => HookResult;
    'merkaly:tenant': (claims?: User) => HookResult;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth0: MerkalyAuth0Client;
    $api: MerkalyApi;
    $gmap: never;
  }
}

declare module 'bootstrap-vue-next' {
  interface BaseButtonVariant { // Metronic button variants
    'active-light-primary': unknown;
    'light-dark': unknown;
    'none': unknown;
  }
}

export {};
