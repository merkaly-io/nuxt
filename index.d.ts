import { SDK as MerkalySDK } from '@merkaly/sdk-js'
import Merkaly from './plugins/merkaly'

export * from '@nuxt/types'
export * as sentry from '@nuxtjs/sentry'
export * from '@merkaly/sdk-js'
export * from '@nuxtjs/axios'
export * as sweetalert from 'vue-sweetalert2'
export * from '@nuxtjs/auth-next'
export * from 'vue-toastification'
export * from 'bootstrap-vue'

export interface MerkalyNuxt {
  $path (name: String, params?: Record<string, any>): Object

  $merkaly: Merkaly
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
    merkaly?: MerkalySDK
  }
}

declare module 'vuex/types/index' {
  interface Store<S> extends MerkalyNuxt {
  }
}
