import type { User } from '@auth0/auth0-spa-js';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { useAuth, defineNuxtPlugin, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin(async () => {
  const { public: $config } = useRuntimeConfig();

  const auth0 = await createAuth0Client({

    authorizationParams: {
      audience: $config.auth0Audience,
      prompt: 'login',
      redirect_uri: location.origin.concat($config.merkaly.auth0.callback),
    },
    cacheLocation: 'localstorage',
    clientId: $config.merkaly.auth0.client,
    domain: $config.merkaly.auth0.domain,
    useRefreshTokens: true,
  });

  const { isLoading, user, token } = useAuth();

  // clone while keeping prototype & methods
  const self0 = Object.assign(Object.create(Object.getPrototypeOf(auth0)), auth0);

  auth0.getUser = () => self0.getUser()
    .then((result: User) => (user.value = result));

  auth0.getTokenSilently = () => self0.getTokenSilently()
    .then((result: string) => (token.value = result));

  auth0.checkSession = () => self0.checkSession()
    .then(async () => Promise.all([auth0.getUser(), auth0.getTokenSilently()]))
    .finally(() => (isLoading.value = false));

  return { provide: { auth0 } };
});
