import type { ComposableOptions, UseApiReturn } from '../composables/useApi';
import { useApi } from '../composables/useApi';
import type { HooksOptions } from '../plugins/api.global';
import { defu } from 'defu';

export interface AdapterOptions {
  data: unknown;
  meta: Record<string, unknown>;
  params: object;
}

export interface AdapterArgs<TData, TMeta, TParams> extends HooksOptions<TData, TMeta, TParams> {
  immediate?: boolean;
  params?: Partial<TParams>;
}

type AdapterCallback<T extends AdapterOptions> = (args: T['params']) => AdapterArgs<T['data'], T['meta'], T['params']>;

export const withAdapter = <T extends AdapterOptions>(
  callback: (params: T['params']) => ComposableOptions<T['data'], T['meta']>,
) => (
  args?: AdapterCallback<T>,
): UseApiReturn<T['data'], T['meta'], T['params']> => {
  return useApi<T['data'], T['meta'], T['params']>((executionParams) => {
    // Get config from args callback with execution params
    const config = args?.(executionParams) || {};
    const { params: initialParams = {}, ...hooks } = config;

    const mergedParams = { ...initialParams, ...executionParams } as T['params']; // shallow: an execute key replaces the initial one whole (arrays and objects too), an explicit undefined clears it

    // Call adapter callback with merged params
    const adapterResult = callback(mergedParams);

    // Ensure body is a plain object for ofetch serialization
    if (adapterResult.body && typeof adapterResult.body === 'object' && !(adapterResult.body instanceof FormData)) {
      adapterResult.body = { ...adapterResult.body };
    }

    // Merge hooks with adapter result (hooks take priority for onSuccess, onError, etc.)
    return defu(hooks, adapterResult) as ComposableOptions<T['data'], T['meta']>;
  });
};
