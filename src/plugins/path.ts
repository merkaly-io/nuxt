import { Context } from '@nuxt/types'

export interface NuxtPluginPath {
  $path (name: String, params?: Record<string, any>): Object
}

declare module 'vue/types/vue' {
  interface Vue extends NuxtPluginPath {
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions extends NuxtPluginPath {
  }

  interface Context extends NuxtPluginPath {
  }
}

declare module 'vuex/types/index' {
  interface Store<S> extends NuxtPluginPath {
  }
}

export default ({ app }: Context, inject: Function): Function => {
  app.$path = (name: String, params: Object = {}): Object => ({ name, params })
  inject('path', app.$path)

  return app.$path
}
