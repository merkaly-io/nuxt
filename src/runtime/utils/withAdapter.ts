import type { CallbackArgs } from '../composables/useApi';
import { useApi } from '../composables/useApi';
import type { HooksOptions } from '../plugins/api.global';
import { defu } from 'defu';

type ReturnParams<T extends AdapterOptions> = () => { params: T['params'] } & HooksOptions

export interface AdapterOptions {
  data: unknown;
  meta: Record<string, object>;
  params: object;
}

export const withAdapter = <T extends AdapterOptions>(callback: CallbackArgs<T>) => (args: ReturnParams<T>) => useApi<T>(() => {
  const { params, ...rest } = (args?.() || {});
  const result = callback?.(params);

  return defu(rest, result);
});
