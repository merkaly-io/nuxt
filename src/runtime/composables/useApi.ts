import { ref, useNuxtApp } from '#imports';
import type { ApiOptions } from '~/src/runtime/plugins/api.global';

interface ComposableOptions extends ApiOptions {
  default?: () => any;
  immediate?: boolean;
  uri: string;
}

type CallbackArgs = () => ComposableOptions

export function useApi(callback: CallbackArgs) {
  const { $api } = useNuxtApp();

  const { default: defaultData, uri, immediate, ...options } = callback();

  const controller = new AbortController();

  const loading = ref(false);
  const data = ref(defaultData?.());
  const meta = ref({});
  const params = ref({});
  const error = ref<Error>();

  const execute = () => $api(uri, {
    controller,
    loading,
    ...options,
  });

  return {
    abort: controller.abort,
    data,
    error,
    execute,
    loading,
    meta,
  };
}
