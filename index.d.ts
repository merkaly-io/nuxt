import { WebAuth } from 'auth0-js'

export interface MerkalyNuxt {
  $path (name: String, params?: Record<string, any>): Object

  $auth0: WebAuth
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
  interface Store<S> extends MerkalyNuxt {
  }
}
