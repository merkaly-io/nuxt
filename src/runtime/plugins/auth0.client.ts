import { createAuth0Client, type User } from '@auth0/auth0-spa-js';
import { defineNuxtPlugin, useRuntimeConfig } from '#imports';
import { navigateTo } from '#app';
import { defu } from 'defu';
import { useAuth } from '../composables/useAuth';

export default defineNuxtPlugin(async ({ callHook, hook }) => {
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
    .catch((reason: Error) => console.error('[Auth0] getUser failed', reason));

  auth0.getTokenSilently = (options: Parameters<typeof self0.getTokenSilently>[0] = {}) =>
    self0.getTokenSilently(defu({ authorizationParams: { audience: $config.merkaly.auth0.audience } }, options))
      .then((result: string) => (token.value = result))
      .catch((err: Error) => console.warn('[Auth0] getTokenSilently failed – fallback, user logged in?', err));

  // ---------- Callback ----------
  auth0.handleRedirectCallback = () => self0.handleRedirectCallback()
    .then(({ appState }) => Promise.allSettled([auth0.getUser(), auth0.getTokenSilently()])
      .then(() => void navigateTo(appState?.target || '/')))
    .catch(() => navigateTo('/'));

  // ---------- Login ----------
  auth0.loginWithRedirect = () => self0.loginWithRedirect({
    authorizationParams: {
      audience: $config.merkaly.auth0.audience,
      redirect_uri: URL.canParse($config.merkaly.auth0.callbackUrl)
        ? $config.merkaly.auth0.callbackUrl
        : location.origin.concat($config.merkaly.auth0.callbackUrl),
      scope: 'openid profile email offline_access', // necesario aquí para API
    },
  });

  auth0.logout = () => self0.logout({
    logoutParams: {
      returnTo: URL.canParse($config.merkaly.auth0.logoutUrl)
        ? $config.merkaly.auth0.logoutUrl
        : location.origin.concat($config.merkaly.auth0.logoutUrl),
    },
  });

  // ---------- Bootstrap ----------
  hook('app:created', () => Promise.allSettled([auth0.getUser(), auth0.getTokenSilently()])
    .then(() => callHook('merkaly:auth', user.value))
    .finally(() => isLoading.value = false));

  return { provide: { auth0 } };
});
