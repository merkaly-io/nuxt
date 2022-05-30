interface Merkaly {
  $path (name: String, params?: Record<string, any>): Object
}

declare module 'vue/types/vue' {
  interface Vue extends Merkaly {
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions extends Merkaly {
  }

  interface Context extends Merkaly {
  }
}

export { MerkalyNuxt } from './nuxt'
export * from 'vue-meta'
export * from '@nuxt/types'
export * from 'http-status-codes'
export * as sentry from '@nuxtjs/sentry'
export * as VueSweetAlert2 from 'vue-sweetalert2'
export * from 'sweetalert2'
export * from 'vue-toastification'
