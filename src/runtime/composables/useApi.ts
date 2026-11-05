import type { Ref } from 'vue';
import { getCurrentInstance, onServerPrefetch, reactive, ref, useNuxtApp, useState } from '#imports';
import type { ApiOptions } from '../plugins/api.global';

export interface ComposableOptions<TData = unknown, TMeta = Record<string, unknown>> extends ApiOptions<TData, TMeta> {
  immediate?: boolean;
  uri: string;
}

export interface UseApiReturn<TData, TMeta, TParams> {
  abort: () => void;
  data: Ref<TData>;
  error: Ref<Error | undefined>;
  execute: (args?: Partial<TParams>) => Promise<void>;
  loading: Ref<boolean>;
  meta: Ref<TMeta>;
  params: TParams;
}

function useApi<TData = unknown, TMeta = Record<string, unknown>, TParams extends object = object>(
  callback: (params: TParams) => ComposableOptions<TData, TMeta>,
): UseApiReturn<TData, TMeta, TParams> {
  const { $api } = useNuxtApp();

  const controller = new AbortController();

  const params = reactive({}) as TParams;

  const getOptions = (currentParams: TParams) => {
    const options = callback(currentParams);
    options.method ||= 'GET';
    options.immediate ??= options.method === 'GET';

    return options;
  };

  const initialOptions = getOptions(params);

  // Server-rendered pages keep the first result in the payload; SPA apps (ssr: false) never take this path
  const nuxtApp = useNuxtApp();
  const ssr = import.meta.server || nuxtApp.payload.serverRendered === true;
  const key = `merkaly:api:${initialOptions.method}:${initialOptions.uri}:${JSON.stringify(initialOptions.query ?? {})}`;

  const loading = ref(Boolean(initialOptions.immediate) && !(import.meta.client && nuxtApp.isHydrating)); // immediate: loading from the first render; hydrating keeps the server value
  const data = ssr ? useState<TData>(`${key}:data`, () => initialOptions.default?.() as TData) : ref<TData>(initialOptions.default?.() as TData);
  const meta = ssr ? useState<TMeta>(`${key}:meta`, () => ({} as TMeta)) : ref<TMeta>({} as TMeta);
  const prefetched = ssr ? useState<boolean>(`${key}:prefetched`, () => false) : ref(false);
  const error = ref<Error | undefined>();

  const execute = async (args: Partial<TParams> = {}): Promise<void> => {
    Object.keys(args).forEach((key) => {
      (params as Record<string, unknown>)[key] = (args as Record<string, unknown>)[key];
    });

    const currentOptions = getOptions(params);

    await $api(currentOptions.uri, {
      ...currentOptions,
      controller,
      data: data as Ref<unknown>,
      default: currentOptions.default,
      error: error as Ref<unknown>,
      loading,
      meta: meta as Ref<Record<string, unknown>>,
      params,
    }).catch((reason) => {
      loading.value = false; // failed before the request (token, tenant): never leave a spinner on
      throw reason;
    });
  };

  if (initialOptions.immediate) {
    const instance = getCurrentInstance();

    if (instance) onServerPrefetch(() => execute().then(() => void (prefetched.value = true))); // also on the client (never runs): Vue numbers useId by serverPrefetch boundaries

    if (import.meta.server ? !instance : !(nuxtApp.isHydrating && prefetched.value)) {
      void execute(); // hydrating with server data: no second request
    }
  }

  return {
    abort: () => controller.abort(),
    data: data as Ref<TData>,
    error,
    execute,
    loading,
    meta: meta as Ref<TMeta>,
    params,
  };
}

export { useApi };
