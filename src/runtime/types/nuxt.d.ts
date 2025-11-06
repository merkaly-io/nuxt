import type { Auth0Client } from '@auth0/auth0-spa-js';
import type { ApiOptions } from '../plugins/api.global';

declare module '#app' {
  interface NuxtApp {
    $auth0: Auth0Client;
    $api: (url: string, options?: ApiOptions) => Promise<unknown>;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth0: Auth0Client;
    $api: (url: string, options?: ApiOptions) => Promise<unknown>;
  }
}
