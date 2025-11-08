import { ref, reactive, useNuxtApp } from '#imports';
import type { Reactive } from 'vue';
import type { ApiOptions } from '~/src/runtime/plugins/api.global';

interface ComposableOptions extends ApiOptions {
  immediate?: boolean;
  uri: string;
}

type CallbackArgs = (args?: Reactive<unknown>) => ComposableOptions

export function useApi(callback: CallbackArgs) {
  const { $api } = useNuxtApp();

  const controller = new AbortController();

  const params = reactive({});
  const { default: defaultData, uri, ...options }: ComposableOptions = callback(params);

  options.method ||= 'GET';
  options.immediate = options.immediate ?? options.method === 'GET'; // Por defecto será true solo si el méthod es GET.

  const loading = ref(false);
  const data = ref(defaultData?.());
  const meta = ref({});
  const error = ref<Error>();

  const execute = (args: Record<string, unknown> = {}) => {
    Object.assign(params, args);

    return $api(uri, {
      ...options,
      controller,
      data,
      default: defaultData,
      error,
      loading,
    });
  };

  // 🧩 Nueva lógica de ejecución inmediata
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
