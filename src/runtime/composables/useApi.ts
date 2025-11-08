import { ref, reactive, useNuxtApp } from '#imports';
import type { Reactive } from 'vue';
import type { ApiOptions } from '~/src/runtime/plugins/api.global';

interface ComposableOptions extends ApiOptions {
  default?: () => unknown;
  immediate?: boolean;
  uri: string;
}

type CallbackArgs = (args?: Reactive<unknown>) => ComposableOptions

export function useApi(callback: CallbackArgs) {
  const { $api } = useNuxtApp();

  const controller = new AbortController();

  const params = reactive({});
  const { default: defaultData, uri, immediate, ...options }: ComposableOptions = callback(params);

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
      loading,
    });
  };

  return {
    abort: controller.abort,
    data,
    error,
    execute,
    loading,
    meta,
  };
}
