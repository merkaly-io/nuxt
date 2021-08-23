import { AxiosOptions } from '@nuxtjs/axios'
import { MerkalyParams } from './module'

export * from 'vue-meta'
export * from '@nuxt/types'
export * from '@merkaly/api'
export * from '@merkaly/sdk-js'
export * from 'http-status-codes'
export * from '@types/auth0'
export * as sentry from '@nuxtjs/sentry'
export * from '@nuxtjs/axios'
export * from 'vue-sweetalert2'
export * from 'sweetalert2'
export * from '@nuxtjs/auth-next'
export * from 'vue-toastification'
export * from 'bootstrap-vue'

export interface MerkalyNuxt {
  $path (name: String, params?: Record<string, any>): Object
}

declare module 'vue/types/vue' {
  interface Vue extends MerkalyNuxt {
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions extends MerkalyNuxt {
  }

  interface Context extends MerkalyNuxt {
  }
}

declare module '@nuxt/types/config/runtime' {
  interface NuxtRuntimeConfig {
    merkaly?: MerkalyParams,
  }

  interface NuxtOptionsRuntimeConfig {
    merkaly?: MerkalyParams
    axios?: AxiosOptions
  }
}

declare module 'vuex/types/index' {
  interface Store extends MerkalyNuxt {
  }
}
