import { defineNuxtPlugin, useNuxtApp, useRequestURL, useRuntimeConfig } from '#app';
import type { Ref } from '#imports';
import { useAuth, useOrganization } from '#imports';
import type { FetchOptions, FetchResponse } from 'ofetch';

const GLOBAL_API_HEADER = 'x-merkaly-global';
const CLIENT_HEADER = 'x-merkaly-client'; // the app's Auth0 client id, checked by the api against the token azp

type OnBeforeSendArgs = { query: FetchOptions['query'], body: FetchOptions['body'], headers: FetchOptions['headers'] }
type OnResponseArgs = { response: FetchResponse<unknown>, request: RequestInfo }
type OnSuccessArgs<TData = unknown, TMeta = Record<string, unknown>, TParams = object> = {
  data: TData,
  meta: TMeta,
  headers: FetchOptions['headers'],
  params: TParams
}
type OnCompleteArgs = { response?: FetchResponse<unknown>, request: RequestInfo }

export interface RefOptions {
  data?: Ref<unknown>;

  error?: Ref<unknown>;

  loading?: Ref<boolean>;

  meta?: Ref<Record<string, unknown>>;
}

export interface HooksOptions<TData = unknown, TMeta = Record<string, unknown>, TParams = object> {
  onBeforeSend?(args: OnBeforeSendArgs): Promise<unknown> | unknown;

  onComplete?(args: OnCompleteArgs): Promise<unknown> | unknown;

  onError?(reason: Error, args: OnResponseArgs): Promise<unknown> | unknown;

  onFatal?(reason: Error): Promise<unknown> | unknown;

  onResponse?(args: OnResponseArgs): Promise<unknown> | unknown;

  onSuccess?(args: OnSuccessArgs<TData, TMeta, TParams>): Promise<unknown> | unknown;
}

export interface ParamsOptions {
  body?: FetchOptions['body'];

  controller?: AbortController;

  default?: () => unknown;

  global?: boolean;

  headers?: FetchOptions['headers'];

  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  query?: FetchOptions['query'];

  requiresTenant?: boolean;

  timeout?: FetchOptions['timeout'];
}

export type ApiOptions<TData = unknown, TMeta = Record<string, unknown>, TParams = object> =
  ParamsOptions
  & HooksOptions<TData, TMeta, TParams>
  & RefOptions
  & { params?: TParams }

// SSR calls skip the Nuxt proxy (an internal call would carry the server host) and reach the API directly
function serverBaseURL(api: { url: string, prefix?: string }, global?: boolean) {
  const prefix = global ? '' : (api.prefix ?? '').replace(/^\/+|\/+$/g, '');

  return prefix ? `${api.url.replace(/\/+$/, '')}/${prefix}` : api.url;
}

export default defineNuxtPlugin(({ provide }) => {
  const requestHost = import.meta.server ? useRequestURL().host : undefined; // per request on the server

  // Same as the proxy: local mkcert certificates of *.test APIs are not trusted by Node
  if (import.meta.server && import.meta.dev && new URL(useRuntimeConfig().public.merkaly.api.url).hostname.endsWith('.test')) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  const nuxtApp = useNuxtApp();

  provide('api', async (url: string, options: ApiOptions = {}) => {
    const { token } = useAuth();

    if (import.meta.client && token.value) await nuxtApp.$auth0?.getTokenSilently(); // cached until it expires, then renewed with the refresh token
    const { id: tenant } = useOrganization();
    const { public: { merkaly } } = useRuntimeConfig();

    const requiresTenant = options.requiresTenant ?? merkaly.auth0.requiresTenant;

    if (!tenant.value && !options.global && requiresTenant) {
      throw new Error(
        `[api] Tenant context is required but not set for: ${url}\n` +
        `This surface has requiresTenant: true. Possible causes:\n` +
        `  1. The request fired before the auth boot sequence completed (race condition).\n` +
        `  2. useOrganization().setId() was never called in this surface's auth plugin.\n` +
        `  3. The adapter should use { global: true } to bypass tenant enforcement.`,
      );
    }

    await $fetch(url, {
      baseURL: import.meta.server ? serverBaseURL(merkaly.api, options.global) : '/api',

      body: options?.body,

      headers: {
        authorization: token.value ? `Bearer ${token.value}` : '',
        identity: tenant.value,
        [GLOBAL_API_HEADER]: options.global ? 'true' : '',
        ...(requestHost ? { 'x-merkaly-host': requestHost } : {}), // tenant host, as the proxy sends it
        ...(merkaly.auth0.client ? { [CLIENT_HEADER]: merkaly.auth0.client } : {}),
        ...options?.headers,
      },

      method: options?.method,

      onRequest: async () => {
        if (options.data) options.data.value = options.default?.();
        if (options.meta) options.meta.value = {};
        if (options.error) options.error.value = undefined;
        if (options.loading) options.loading.value = true;

        const result = await Promise.resolve(options?.onBeforeSend?.({ body: options.body, headers: options.headers, query: options.query }))
          .then((res) => res)
          .catch(() => false); // si lanza excepción, tratamos como false

        if (result === false) {
          options.controller?.abort?.('Request aborted by onBeforeSend');
        }
      },

      onRequestError: async ({ error, response, request }) => {
        await options.onFatal?.(error);
        if (options.error) options.error.value = error;

        await options?.onComplete?.({ response, request });

        if (options.loading) options.loading.value = false;
      },

      onResponse: async ({ response, request }) => {
        const { status, _data, headers } = response;
        const { data, meta } = (_data || {});

        await options?.onResponse?.({ response, request });

        // ignorar errores
        if (status >= 400) return;

        await options?.onSuccess?.({ data, meta, headers, params: options.params as object });
        if (options.data) options.data.value = data;
        if (options.meta) options.meta.value = meta;

        await options?.onComplete?.({ response, request });

        if (options.loading) options.loading.value = false;
      },

      onResponseError: async ({ response, request }) => {
        const { _data } = response;

        await options.onError?.(_data, { response, request });
        if (options.error) options.error.value = _data;

        await options?.onComplete?.({ response, request });

        if (options.loading) options.loading.value = false;
      },

      query: options?.query,

      retry: false,

      signal: options.controller?.signal,
    }).catch(reason => reason);
  });
});
