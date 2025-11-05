import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import { createAuth0Client } from '@auth0/auth0-spa-js';

export default defineNuxtPlugin(async (nuxtApp) => {
  const { public: $config } = useRuntimeConfig();

  console.log('$config.merkaly', $config.merkaly);

  const auth0: Auth0Client = await createAuth0Client({
    authorizationParams: {
      redirect_uri: window.location.origin.concat($config.merkaly.auth0.callback),
      ...($config.merkaly.auth0.params || {}),
    },
    cacheLocation: 'localstorage',
    clientId: $config.merkaly.auth0.client,
    domain: $config.merkaly.auth0.domain,
  });

  console.log('Auth0 Plugin injected!');

  nuxtApp.provide('auth0', auth0);
});
