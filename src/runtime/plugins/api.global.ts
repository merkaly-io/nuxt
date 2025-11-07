import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import type { FetchOptions, FetchResponse } from 'ofetch';

type OnBeforeSendArgs = { query: FetchOptions['query'], body: FetchOptions['body'], headers: FetchOptions['headers'] }
type OnResponseArgs = { response: FetchResponse<unknown>, request: RequestInfo }
type OnSuccessArgs = { data: unknown, meta: Record<string, unknown>, headers: FetchOptions['headers'] }
type OnCompleteArgs = { response?: FetchResponse<unknown>, request: RequestInfo }

export interface ApiOptions {
  body?: FetchOptions['body'];

  headers?: FetchOptions['headers'];

  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  query?: FetchOptions['query'];

  prefix?: string;

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

  const controller = new AbortController();

  return $fetch(url, {
    // Determine the base URL
    baseURL: new URL(options.prefix || $config.merkaly.basePrefix || '/', $config.merkaly.baseUrl).href,

    body: options?.body,

    headers: options?.headers,

    method: options?.method,

    onRequest: async () => {
      const result = await Promise.resolve(options?.onBeforeSend?.({ body: options.body, headers: options.headers, query: options.query }))
        .then((res) => res)
        .catch(() => false); // si lanza excepción, tratamos como false

      if (result === false) {
        controller.abort('Request aborted by onBeforeSend');
      }
    },

    onRequestError: async ({ error, response, request }) => {
      await options.onFatal?.(error);
      await options?.onComplete?.({ response, request });
    },

    onResponse: async ({ response, request }) => {
      const { status, _data, headers } = response;
      const { data, meta } = (_data || {});

      await options?.onResponse?.({ response, request });

      // ignorar errores
      if (status >= 400) return;

      await options?.onSuccess?.({ data, meta, headers });
      await options?.onComplete?.({ response, request });
    },

    onResponseError: async ({ response, request }) => {
      const { _data } = response;

      await options.onError?.(_data);
      await options?.onComplete?.({ response, request });
    },

    query: options.query,

    retry: false,

    // Hook for request handling before sending
    signal: controller.signal,
  })
    .catch((reason) => reason);
}));
