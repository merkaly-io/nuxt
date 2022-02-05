export * from 'vue-meta'
export * from '@nuxt/types'
export * from 'http-status-codes'
export * as sentry from '@nuxtjs/sentry'
export * from 'vue-sweetalert2'
export * from 'sweetalert2'
export * from 'vue-toastification'

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

declare module 'vuex/types/index' {
  interface Store extends MerkalyNuxt {
  }
}
