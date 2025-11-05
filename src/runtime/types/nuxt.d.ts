import type { Auth0Client } from '@auth0/auth0-spa-js';

declare module '#app' {
  interface NuxtApp {
    $auth0: Auth0Client;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $auth0: Auth0Client;
  }
}
