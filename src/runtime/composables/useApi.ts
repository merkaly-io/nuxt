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

  const getOptions = (): ComposableOptions => {
    const options = callback(params);
    options.method ||= 'GET';
    options.immediate ??= options.method === 'GET';
    return options;
  };

  const initialOptions = getOptions();

  const loading = ref(false);
  const data = ref(initialOptions.default?.());
  const meta = ref({});
  const error = ref<Error>();

  const execute = (args: Record<string, unknown> = {}) => {
    Object.assign(params, args);

    const currentOptions = getOptions();

    return $api(currentOptions.uri, {
      ...currentOptions,
      controller,
      data,
      default: currentOptions.default,
      error,
      loading
      ,
    });
  };

  if (initialOptions.immediate) {
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
