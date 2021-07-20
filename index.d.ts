import { MerkalyParams } from './module'

export * from '@nuxt/types'
export * from '@types/auth0-lock'
export * as sentry from '@nuxtjs/sentry'
export * from '@nuxtjs/axios'
export * as sweetalert from 'vue-sweetalert2'
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
    merkaly: MerkalyParams
  }
  interface NuxtOptionsRuntimeConfig {
    merkaly: MerkalyParams
  }
}

declare module 'vuex/types/index' {
  interface Store extends MerkalyNuxt {
  }
}
