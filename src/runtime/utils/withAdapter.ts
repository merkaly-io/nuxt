import type { ComposableOptions, UseApiReturn } from '../composables/useApi';
import { useApi } from '../composables/useApi';
import type { HooksOptions } from '../plugins/api.global';
import { defu } from 'defu';

export interface AdapterOptions {
  data: unknown;
  meta: Record<string, unknown>;
  params: object;
}

export interface AdapterArgs<TData, TMeta, TParams> extends HooksOptions<TData, TMeta> {
  params?: Partial<TParams>;
}

type AdapterCallback<T extends AdapterOptions> = (args: T['params']) => AdapterArgs<T['data'], T['meta'], T['params']>;

export const withAdapter = <T extends AdapterOptions>(
  callback: (params: T['params']) => ComposableOptions,
) => (
  args?: AdapterCallback<T>,
): UseApiReturn<T['data'], T['meta'], T['params']> => {
  return useApi<T['data'], T['meta'], T['params']>((executionParams) => {
    // Get config from args callback with execution params
    const config = args?.(executionParams) || {};
    const { params: initialParams = {}, ...hooks } = config;

    // Merge initial params with execution params (execution params take priority)
    const mergedParams = defu(executionParams, initialParams) as T['params'];

    // Call adapter callback with merged params
    const adapterResult = callback(mergedParams);

    // Merge hooks with adapter result (hooks take priority for onSuccess, onError, etc.)
    return defu(hooks, adapterResult) as ComposableOptions;
  });
};
