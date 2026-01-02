import type { User } from '@auth0/auth0-spa-js';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { useAuth, defineNuxtPlugin, useRuntimeConfig } from '#imports';
import { defu } from 'defu';

export default defineNuxtPlugin(async () => {
  const { public: $config } = useRuntimeConfig();

  const auth0 = await createAuth0Client({
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

  auth0.getTokenSilently = (options: any = {}) =>
    self0.getTokenSilently(defu(options, { authorizationParams: { audience: $config.merkaly.auth0.audience } }))
      .then((result: string) => (token.value = result))
      .catch((reason) => console.error('[Auth0] getTokenSilently failed', reason));

  auth0.handleRedirectCallback = () => self0.handleRedirectCallback()
    .then(({ appState }) => location.href = (appState.target || '/'))
    .catch(() => location.href = '/');

  auth0.checkSession = () => self0.checkSession()
    .then(async () => Promise.all([auth0.getUser(), auth0.getTokenSilently()]))
    .catch(() => ({}))
    .finally(() => (isLoading.value = false));

  auth0.loginWithRedirect = () => self0.loginWithRedirect({
    authorizationParams: {
      audience: $config.merkaly.auth0.audience,
      redirect_uri: URL.canParse($config.merkaly.auth0.callbackUrl)
        ? $config.merkaly.auth0.callbackUrl
        : location.origin.concat($config.merkaly.auth0.callbackUrl),
      scope: 'openid profile email offline_access',
    },
  });

  auth0.logout = () => self0.logout({
    logoutParams: {
      returnTo: URL.canParse($config.merkaly.auth0.logoutUrl)
        ? $config.merkaly.auth0.logoutUrl
        : location.origin.concat($config.merkaly.auth0.logoutUrl),
    },
  });

  return { provide: { auth0 } };
});
