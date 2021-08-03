import SDK from '@merkaly/sdk-js'
import { Context } from '@nuxt/types'

declare module 'vue/types/vue' {
  interface Vue {
    $merkaly: SDK.Manager
  }
}

export default ({ app }: Context, inject: Function) => {
  app.$merkaly = new SDK.Manager()
  inject('merkaly', app.$merkaly)

  return app.$merkaly
}
