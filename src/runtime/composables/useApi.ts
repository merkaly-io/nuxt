import { ref, reactive, useNuxtApp } from '#imports';
import type { ApiOptions } from '../plugins/api.global';

export interface ComposableOptions extends ApiOptions {
  immediate?: boolean;
  uri: string;
}

export type CallbackArgs<T extends object> = (args: T) => ComposableOptions;

function useApi<D extends object>(callback: CallbackArgs<D>) {
  const { $api } = useNuxtApp();

  const controller = new AbortController();

  const params = reactive({}) as D;

  const options: ComposableOptions = callback(params);

  const loading = ref(false);
  const data = ref(options.default?.());
  const meta = ref({});
  const error = ref<Error>();

  const execute = (args: Record<string, unknown> = {}) => {
    Object.assign(params, args);

    return $api(options.uri, {
      ...options,
      controller,
      data,
      default: options.default,
      error,
      loading,
    });
  };

  options.method ||= 'GET';
  options.immediate ??= options.method === 'GET';

  if (options.immediate) {
    void execute();
  }

  return {
    abort: controller.abort,
    data,
    error,
    execute,
    loading,
    meta,
  };
}

export { useApi };
