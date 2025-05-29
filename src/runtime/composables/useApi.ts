import type { FetchResponse } from 'ofetch'
import type { TypedHeaders } from 'h3'
import { ref, useRuntimeConfig } from '#imports'
import type { Ref } from '#imports'

export interface ApiOptions<D = unknown, M = unknown> {
  body?: Record<string, unknown>
  default?: () => D // Request body data
  headers?: Record<string, string | number | boolean> // Default data in case of an error
  immediate?: boolean // Whether to execute the request immediately
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' // HTTP method
  query?: Record<string, unknown>

  onBeforeSend?(response?: FetchResponse<D>): Promise<unknown> | unknown // Query parameters for the request

  // Lifecycle hooks
  onComplete?(response?: FetchResponse<D>): unknown

  onError?(reason: Error, headers: TypedHeaders): Promise<unknown> | unknown

  onFatal?(reason: Error, headers: TypedHeaders): Promise<unknown> | unknown

  onResponse?(response: FetchResponse<D>): unknown

  onSuccess?(data: D, meta: M, headers: TypedHeaders): Promise<unknown> | unknown
}

export interface ExecuteOptions {
  body?: Record<string, unknown>
  headers?: Record<string, unknown>
  query?: Record<string, unknown>
}

export interface ApiProviders {
  endpoint: string
  locked?: string[]
  token?: string
}

interface UseApiReturn<D, M> {
  data: Ref<D>
  meta: Ref<M>
  error: Ref<unknown>
  loading: Ref<boolean>
  execute: (params?: ExecuteOptions) => Promise<FetchResponse<unknown>> // ajusta esto si sabes el tipo exacto
}

export function useApi<D, M = object>(uri: string, options: ApiOptions<D, M> = {}): UseApiReturn<D, M> {
  const controller = new AbortController() // Create an AbortController to handle request cancellation
  const { public: $config } = useRuntimeConfig() // Get runtime configuration

  const token = ref('mytoken')
  const identity = ref('staging')
  const locked = ref<unknown[]>([])

  const loading = ref(false)
  const data = ref(options?.default?.() as D)
  const meta = ref({} as M)
  const error = ref()

  function execute(params: ExecuteOptions = {}) {
    return $fetch(uri, {
      baseURL: String($config.BASE_URL), // Determine the base URL

      body: params?.body || options?.body, // Set the request body

      headers: {
        // Add authorization header if token is available
        authorization: token.value ? `Bearer ${token.value}` : '',
        identity: identity.value,
        ...(params?.headers || {}),
        ...(options?.headers || {}),
      }, // Ignore response errors for custom handling

      method: options?.method, // Set query parameters

      onRequest: ({ response }) => {
        loading.value = true
        options?.onBeforeSend?.(response)
      },

      onRequestError: async ({ error, response }) => {
        controller.abort(error)

        await options?.onError?.(response?._data, (response?.headers || {}) as TypedHeaders)
        await options?.onComplete?.(response)

        loading.value = false
      },

      onResponse: async (context) => {
        const { response } = context
        const { status, _data } = response

        // Lock user if response status is 401
        if (response.status === 401) {
          locked.value.push(uri)
        }

        const isExternal = uri.startsWith('http') // Check if the URI is external

        data.value = (isExternal ? _data : _data?.data) || options?.default?.() // Extract data from the response
        meta.value = !isExternal ? {} : (_data?.meta || {}) // Extract metadata from the response

        await options?.onResponse?.(response)

        const headers: TypedHeaders = Object.fromEntries(response.headers.entries())

        if (status >= 200 && status <= 299) {
          // Pass response headers as the third argument to onSuccess
          await options?.onSuccess?.(data.value, meta.value, headers)
        }

        if (status >= 400 && status <= 499) {
          await options?.onError?.(response._data, headers)
        }

        if (status >= 500 && status <= 599) {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          (await options?.onFatal?.(meta.value, headers)) || options?.onError?.(response._data, headers)
        }

        await options?.onComplete?.(response)
        loading.value = false
      }, // Set the abort signal

      // Hook for request handling before sending
      query: params?.query || options?.query,

      // Hook for handling the response
      retry: false,

      signal: controller.signal,
    })
  }

  /**
   * Executes the `execute` function immediately based on the provided options.
   *
   * Conditions:
   * - The `immediate` option must not be explicitly set to `false`.
   * - The `method` option must either be undefined or set to `'GET'`.
   *
   * This ensures that the `execute` function is triggered automatically for
   * GET requests or when no HTTP method is specified.
   */
  if (options?.immediate !== false && (!options.method || options.method === 'GET')) {
    execute()
  }

  return {
    data,
    error,
    execute,
    loading,
    meta,
  }
}
