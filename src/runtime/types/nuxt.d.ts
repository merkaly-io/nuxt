import type { Auth0Client, User } from '@auth0/auth0-spa-js';
import type { ApiOptions } from '../plugins/api.global';

declare module '#app' {
  interface NuxtApp {
    $auth0: Auth0Client;
    $api: (url: string, options?: ApiOptions) => Promise<void>;
  }

  interface RuntimeNuxtHooks {
    'merkaly:auth': (user: User | null) => void | Promise<void>;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth0: Auth0Client;
    $api: (url: string, options?: ApiOptions) => Promise<void>;
  }
}
