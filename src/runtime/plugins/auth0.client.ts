import type { GenericError, User, RedirectConnectAccountOptions } from '@auth0/auth0-spa-js';
import { createAuth0Client } from '@auth0/auth0-spa-js';
import { defineNuxtPlugin, useRuntimeConfig, useNuxtApp } from '#imports';
import { navigateTo } from '#app';
import { defu } from 'defu';
import { useAuth } from '../composables/useAuth';

// Auth0 errors meaning "there is no session", not "something broke"
const NO_SESSION_ERRORS = ['consent_required', 'interaction_required', 'invalid_grant', 'login_required', 'missing_refresh_token'];

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

  const { isLoading, user, token, fail } = useAuth();

  // clone while keeping prototype & methods
  const self0 = Object.assign(Object.create(Object.getPrototypeOf(auth0)), auth0);

  let tokenError: GenericError | undefined;

  auth0.getUser = () => self0.getUser()
    .then((result: User) => (user.value = result))
    .catch((reason: Error) => console.error('[Auth0] getUser failed', reason));

  auth0.getTokenSilently = (options = {}) =>
    self0.getTokenSilently(defu({ authorizationParams: { audience: $config.merkaly.auth0.audience } }, options))
      .then((result: string) => {
        tokenError = undefined;

        return (token.value = result);
      })
      .catch((err: GenericError) => {
        tokenError = err;

        console.warn('[Auth0] getTokenSilently failed – fallback, user logged in?', err);
      });

  const resolveIdentity = () => Promise.allSettled([auth0.getUser(), auth0.getTokenSilently()]);

  const initTenantContext = async () => {
    await callHook('merkaly:tenant', user.value);
    await callHook('merkaly:auth', user.value);
  };

  // A known user without a token is a real failure; a missing Auth0 session is not
  // (anonymous visitors and the auth middleware already handle that case)
  const startSession = () => {
    if (user.value && !token.value && tokenError && !NO_SESSION_ERRORS.includes(tokenError.error)) {
      return fail({ message: tokenError.error_description || tokenError.message, stage: 'token' });
    }

    return initTenantContext();
  };

  hook('merkaly:auth:retry', () => resolveIdentity().then(startSession));

  // ---------- Callback ----------
  auth0.handleRedirectCallback = () => self0.handleRedirectCallback()
    .then(async ({ appState }: RedirectConnectAccountOptions) => {
      await resolveIdentity();
      await startSession();

      void navigateTo(appState?.target || '/');
    }, (reason: GenericError) => fail({ message: reason.error_description || reason.message, stage: 'callback' }));

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
  auth0.linkWithConnection = async (connection: string) => {
    await linkingClient.loginWithPopup({ authorizationParams: { connection } });
    const claims = await linkingClient.getIdTokenClaims();

    if (!claims?.sub) {
      throw new Error('Failed to get ID token for linking');
    }
    // sub format: "provider|user_id" (e.g., "GitHub|16559276")
    const [provider, ...userIdParts] = claims.sub.split('|');
    const userId = userIdParts.join('|');
    const body = { provider, userId };
    const { $api } = useNuxtApp();

    return await $api('/identities', { body, global: true, method: 'POST' });
  };

  // ---------- Bootstrap ----------
  const isAuthCallback = window.location.pathname === callbackPath;

  if (!isAuthCallback) {
    await resolveIdentity();

    hook('app:created', startSession);
  }

  isLoading.value = false;

  return { provide: { auth0 } };
});
