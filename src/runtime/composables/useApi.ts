import { reactive, ref } from 'vue';
import { useNuxtApp } from '#imports';
import type { Ref } from 'vue';
import type { ApiOptions } from '../plugins/api.global';

export interface ComposableOptions<TData = unknown, TMeta = Record<string, unknown>> extends ApiOptions<TData, TMeta> {
  immediate?: boolean;
  uri: string;
}

export interface UseApiReturn<TData, TMeta, TParams> {
  abort: () => void;
  data: Ref<TData>;
  error: Ref<Error | undefined>;
  execute: (args?: Partial<TParams>) => Promise<void>;
  loading: Ref<boolean>;
  meta: Ref<TMeta>;
  params: TParams;
}

function useApi<TData = unknown, TMeta = Record<string, unknown>, TParams extends object = object>(
  callback: (params: TParams) => ComposableOptions<TData, TMeta>,
): UseApiReturn<TData, TMeta, TParams> {
  const { $api } = useNuxtApp();

  const controller = new AbortController();

  const params = reactive({}) as TParams;

  const getOptions = (currentParams: TParams): ComposableOptions => {
    const options = callback(currentParams);
    options.method ||= 'GET';
    options.immediate ??= options.method === 'GET';
    return options;
  };

  const initialOptions = getOptions(params);

  const loading = ref(false);
  const data = ref<TData>(initialOptions.default?.() as TData);
  const meta = ref<TMeta>({} as TMeta);
  const error = ref<Error | undefined>();

  const execute = async (args: Partial<TParams> = {}): Promise<void> => {
    Object.keys(args).forEach((key) => {
      (params as Record<string, unknown>)[key] = (args as Record<string, unknown>)[key];
    });

    const currentOptions = getOptions(params);

    await $api(currentOptions.uri, {
      ...currentOptions,
      controller,
      data: data as Ref<unknown>,
      default: currentOptions.default,
      error: error as Ref<unknown>,
      loading,
      meta: meta as Ref<Record<string, unknown>>,
      params,
    });
  };

  if (initialOptions.immediate) {
    void execute();
  }

  return {
    abort: () => controller.abort(),
    data: data as Ref<TData>,
    error,
    execute,
    loading,
    meta: meta as Ref<TMeta>,
    params,
  };
}

export { useApi };
