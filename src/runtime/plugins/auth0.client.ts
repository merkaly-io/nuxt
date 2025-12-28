import type { User } from '@auth0/auth0-spa-js';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { useAuth, defineNuxtPlugin, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin(async () => {
  const { public: $config } = useRuntimeConfig();

  const auth0 = await createAuth0Client({

    authorizationParams: {
      audience: $config.auth0Audience,
      redirect_uri: URL.canParse($config.merkaly.auth0.callback)
        ? $config.merkaly.auth0.callback
        : location.origin.concat($config.merkaly.auth0.callback),
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
    .then((result: User) => (user.value = result))
    .catch(() => undefined);

  auth0.getIdTokenClaims = () => self0.getIdTokenClaims()
    .then((result) => (token.value = result?.__raw))
    .catch(() => undefined);

  auth0.handleRedirectCallback = () => self0.handleRedirectCallback()
    .then(({ appState }) => location.href = (appState.target || '/'))
    .catch(() => location.href = '/');

  auth0.checkSession = () => self0.checkSession()
    .then(async () => Promise.all([auth0.getUser(), auth0.getIdTokenClaims()]))
    .catch(() => ({}))
    .finally(() => (isLoading.value = false));

  return { provide: { auth0 } };
});
