import type { ComposableOptions } from '../composables/useApi';
import { useApi } from '../composables/useApi';
import type { HooksOptions } from '../plugins/api.global';
import { defu } from 'defu';

type ReturnParams<T extends AdapterOptions> = () => { params?: T['params'] } & HooksOptions;

export interface AdapterOptions {
  data: unknown;
  meta: Record<string, object>;
  params: object;
}

export const withAdapter = <T extends AdapterOptions>(callback: (params: T['params']) => ComposableOptions) => (args?: ReturnParams<T>) => useApi<T['params']>((executionParams) => {
  // Get initial configuration (hooks and initial params)
  const initialConfig = args?.() || {};
  const { params: initialParams = {}, ...hooks } = initialConfig;

  // Merge initial params with execution params (execution params take priority)
  const mergedParams = defu(executionParams, initialParams) as T['params'];

  // Call adapter callback with merged params
  const adapterResult = callback(mergedParams);

  // Merge hooks with adapter result (hooks take priority for onSuccess, onError, etc.)
  return defu(hooks, adapterResult) as ComposableOptions;
});
