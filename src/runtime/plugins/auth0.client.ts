import { createAuth0Client, PopupCancelledError, type User } from '@auth0/auth0-spa-js';
import { defineNuxtPlugin, useRuntimeConfig, useNuxtApp } from '#imports';
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

  auth0.getTokenSilently = (options = {}) =>
    self0.getTokenSilently(defu({ authorizationParams: { audience: $config.merkaly.auth0.audience } }, options))
      .then((result: string) => (token.value = result))
      .catch((err: Error) => console.warn('[Auth0] getTokenSilently failed – fallback, user logged in?', err));

  // ---------- Callback ----------
  auth0.handleRedirectCallback = () => self0.handleRedirectCallback()
    .then(({ appState }) => Promise.allSettled([auth0.getUser(), auth0.getTokenSilently()])
      .then(() => void navigateTo(appState?.target || '/')))
    .catch(() => navigateTo('/'));

  // ---------- Login ----------
  auth0.loginWithRedirect = (options = {}) => self0.loginWithRedirect(defu(options, {
    authorizationParams: {
      audience: $config.merkaly.auth0.audience,
      redirect_uri: URL.canParse($config.merkaly.auth0.callbackUrl)
        ? $config.merkaly.auth0.callbackUrl
        : location.origin.concat($config.merkaly.auth0.callbackUrl),
      scope: 'openid profile email offline_access', // necesario aquí para API
    },
  }));

  auth0.logout = () => self0.logout({
    logoutParams: {
      returnTo: URL.canParse($config.merkaly.auth0.logoutUrl)
        ? $config.merkaly.auth0.logoutUrl
        : location.origin.concat($config.merkaly.auth0.logoutUrl),
    },
  });

  // ---------- Account Linking ----------
  const callbackUrl = $config.merkaly.auth0.callbackUrl;
  const redirectUri = URL.canParse(callbackUrl) ? callbackUrl : `${location.origin}${callbackUrl}`;

  const linkingClient = await createAuth0Client({
    cacheLocation: 'memory',
    clientId: 'AwD3uBHhLhFBbJhwSWXYFh9cZYidNc6L',
    domain: $config.merkaly.auth0.domain,
    authorizationParams: {
      redirect_uri: redirectUri,
      audience: $config.merkaly.auth0.client,
    },
  });

  (auth0 as any).linkWithConnection = async (connection: string) => {
    try {
      await linkingClient.loginWithPopup({
        authorizationParams: { connection },
      });

      const claims = await linkingClient.getIdTokenClaims();

      if (!claims?.__raw) {
        throw new Error('Failed to get ID token for linking');
      }

      const { $api } = useNuxtApp();

      await $api('/identities', {
        method: 'POST',
        prefix: '/',
        body: { idToken: claims.__raw },
      });
    } catch (error) {
      if (error instanceof PopupCancelledError) {
        console.warn('[Auth0] Linking cancelled by user');
        return;
      }
      throw error;
    }
  };

  // ---------- Bootstrap ----------
  Promise.allSettled([auth0.getUser(), auth0.getTokenSilently()])
    .then(() => hook('app:created', () => callHook('merkaly:auth', user.value)))
    .catch(() => undefined)
    .finally(() => isLoading.value = false);

  return { provide: { auth0 } };
});
