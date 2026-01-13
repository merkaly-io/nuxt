import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import type { Ref } from '#imports';
import { useAuth } from '#imports';
import type { FetchOptions, FetchResponse } from 'ofetch';

type OnBeforeSendArgs = { query: FetchOptions['query'], body: FetchOptions['body'], headers: FetchOptions['headers'] }
type OnResponseArgs = { response: FetchResponse<unknown>, request: RequestInfo }
type OnSuccessArgs = { data: unknown, meta: Record<string, unknown>, headers: FetchOptions['headers'] }
type OnCompleteArgs = { response?: FetchResponse<unknown>, request: RequestInfo }

export interface RefOptions {
  data?: Ref<unknown>;

  error?: Ref<unknown>;

  loading?: Ref<boolean>;

  meta?: Ref<Record<string, unknown>>;
}

export interface HooksOptions {
  onBeforeSend?(args: OnBeforeSendArgs): Promise<unknown> | unknown;

  onComplete?(args: OnCompleteArgs): Promise<unknown> | unknown;

  onError?(reason: Error): Promise<unknown> | unknown;

  onFatal?(reason: Error): Promise<unknown> | unknown;

  onResponse?(args: OnResponseArgs): Promise<unknown> | unknown;

  onSuccess?(args: OnSuccessArgs): Promise<unknown> | unknown;
}

export interface ParamsOptions {
  body?: FetchOptions['body'];

  controller?: AbortController;

  default?: () => unknown;

  headers?: FetchOptions['headers'];

  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  prefix?: string;

  query?: FetchOptions['query'];

  timeout?: FetchOptions['timeout'];
}

export type ApiOptions = ParamsOptions & HooksOptions & RefOptions

export default defineNuxtPlugin(({ provide }) => provide('api', async (url: string, options: ApiOptions = {}) => {
  const { public: $config } = useRuntimeConfig();
  const { tenant, token } = useAuth();

  $fetch(url, {
    // Determine the base URL
    baseURL: new URL(options.prefix || $config.merkaly.api.prefix || '/', $config.merkaly.api.url).href,

    body: options?.body,

    headers: {
      authorization: token.value ? `Bearer ${token.value}` : '',
      identity: tenant.value as string,
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

      await options?.onSuccess?.({ data, meta, headers });
      if (options.data) options.data.value = data;
      if (options.meta) options.meta.value = meta;

      await options?.onComplete?.({ response, request });

      if (options.loading) options.loading.value = false;
    },

    onResponseError: async ({ response, request }) => {
      const { _data } = response;

      await options.onError?.(_data);
      if (options.error) options.error.value = _data;

      await options?.onComplete?.({ response, request });

      if (options.loading) options.loading.value = false;
    },

    query: options?.query,

    retry: false,

    signal: options.controller?.signal,
  }).catch(reason => reason);
}));
