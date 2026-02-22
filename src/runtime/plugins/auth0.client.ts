import { createAuth0Client, type User } from '@auth0/auth0-spa-js';
import { defineNuxtPlugin, useRuntimeConfig, useNuxtApp } from '#imports';
import { navigateTo } from '#app';
import { defu } from 'defu';
import { useAuth } from '../composables/useAuth';

export default defineNuxtPlugin(async ({ callHook, hook }) => {
  const { public: $config } = useRuntimeConfig();
  const callbackPath = URL.canParse($config.merkaly.auth0.callbackUrl)
    ? new URL($config.merkaly.auth0.callbackUrl).pathname
    : $config.merkaly.auth0.callbackUrl;

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
    },
  });

  // @ts-expect-error Creating a lnkWthCntn fn
  auth0.linkWithConnection = (connection: string) => {
    return linkingClient.loginWithPopup({ authorizationParams: { connection } })
      .then(() => linkingClient.getIdTokenClaims())
      .then((claims) => {
        if (!claims?.sub) {
          throw new Error('Failed to get ID token for linking');
        }

        // sub format: "provider|user_id" (e.g., "github|16559276")
        const [provider, ...userIdParts] = claims.sub.split('|');
        const userId = userIdParts.join('|');

        const body = { provider, userId };

        const { $api } = useNuxtApp();

        return $api('/identities', { method: 'POST', prefix: '/', body });
      });
  };

  // ---------- Bootstrap ----------
  const isAuthCallback = window.location.pathname === callbackPath;

  if (!isAuthCallback) {
    await Promise.allSettled([auth0.getUser(), auth0.getTokenSilently()])
      .then(() => hook('app:created', () => callHook('merkaly:auth', user.value)))
      .catch(() => undefined);
  }

  isLoading.value = false;

  return { provide: { auth0 } };
});
