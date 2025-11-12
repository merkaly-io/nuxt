import type { CallbackArgs } from '../composables/useApi';
import { useApi } from '../composables/useApi';
import type { HooksOptions } from '../plugins/api.global';
import { defu } from 'defu';

type ReturnParams<T> = () => { params: T } & HooksOptions

export const withAdapter = <T extends object>(callback: CallbackArgs<T>) => (args: ReturnParams<T>) => useApi<T>(() => {
  const { params, ...rest } = (args?.() || {});
  const result = callback?.(params);

  return defu(rest, result);
});
