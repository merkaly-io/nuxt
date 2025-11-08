import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import type { Ref } from '#imports';
import type { FetchOptions, FetchResponse } from 'ofetch';

type OnBeforeSendArgs = { query: FetchOptions['query'], body: FetchOptions['body'], headers: FetchOptions['headers'] }
type OnResponseArgs = { response: FetchResponse<unknown>, request: RequestInfo }
type OnSuccessArgs = { data: unknown, meta: Record<string, unknown>, headers: FetchOptions['headers'] }
type OnCompleteArgs = { response?: FetchResponse<unknown>, request: RequestInfo }

interface ExposedOptions {
  data?: Ref<unknown>;

  default?: () => unknown;

  error?: Ref<unknown>;

  loading?: Ref<boolean>;

  meta?: Ref<Record<string, unknown>>;
}

export interface ApiOptions extends ExposedOptions {
  body?: FetchOptions['body'];

  controller?: AbortController;

  headers?: FetchOptions['headers'];

  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  prefix?: string;

  query?: FetchOptions['query'];

  timeout?: FetchOptions['timeout'];

  onBeforeSend?(args: OnBeforeSendArgs): Promise<void> | void;

  onComplete?(args: OnCompleteArgs): Promise<void> | void;

  onError?(reason: Error): Promise<void> | void;

  onFatal?(reason: Error): Promise<void> | void;

  onResponse?(args: OnResponseArgs): Promise<void> | void;

  onSuccess?(args: OnSuccessArgs): Promise<void> | void;
}

export default defineNuxtPlugin(({ provide }) => provide('api', async (url: string, options: ApiOptions = {}) => {
  const { public: $config } = useRuntimeConfig();

  return $fetch(url, {
    // Determine the base URL
    baseURL: new URL(options.prefix || $config.merkaly.basePrefix || '/', $config.merkaly.baseUrl).href,

    body: options?.body,

    headers: options?.headers,

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

    query: options.query,

    retry: false,

    signal: options.controller?.signal,
  });
}));
