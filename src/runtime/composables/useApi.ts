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

  const getOptions = (currentParams: D): ComposableOptions => {
    const options = callback(currentParams);
    options.method ||= 'GET';
    options.immediate ??= options.method === 'GET';
    return options;
  };

  // Get initial options with empty params for immediate execution
  const initialOptions = getOptions(params);

  const loading = ref(false);
  const data = ref(initialOptions.default?.());
  const meta = ref({});
  const error = ref<Error>();

  const execute = (args: Partial<D> = {}) => {
    // Merge new args into params
    Object.assign(params, args);

    // Get options with updated params
    const currentOptions = getOptions(params);

    return $api(currentOptions.uri, {
      ...currentOptions,
      controller,
      data,
      default: currentOptions.default,
      error,
      loading,
      meta,
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
