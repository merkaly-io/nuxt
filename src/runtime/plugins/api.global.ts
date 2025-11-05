import { defineNuxtPlugin, useRuntimeConfig } from '#app';
import type { TypedHeaders } from 'h3';

interface ResponseError extends Error {
  error: string,
  statusCode: number
}

interface InvokeOptions {
  body?: RequestInit['body'];

  headers?: RequestInit['headers'];

  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  timeout?: number;

  onBeforeSend?(): void;

  onComplete?(): void;

  onError?(reason: ResponseError, headers: TypedHeaders): void;

  onFatal?(reason: ResponseError, headers: TypedHeaders): void;

  onResponse?(): void;

  onSuccess?(args: { data: unknown, headers: TypedHeaders, meta: unknown, params: unknown }): void;
}

export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.provide('api', invoke);
});

async function invoke(options?: InvokeOptions) {
  const { public: $config } = useRuntimeConfig();

  return $fetch('/aaael', {
    baseURL: new URL($config.merkaly.baseUrlPrefix, $config.merkaly.baseUrl).toString(), // Determine the base URL

    body: options?.body,

    headers: options?.headers,

    method: options?.method,

    onRequest: () => {

    },

    onRequestError: async () => {
    },

    onResponse: async () => {
    },

    onResponseError: () => {
    },

    query: {},

    // Hook for request handling before sending
    retry: false,
  });
}
