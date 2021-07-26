import SDK from '@merkaly/sdk-js'
import { Context } from '@nuxt/types'

declare module 'vue/types/vue' {
  interface Vue {
    $merkaly: SDK.Admin
  }
}

export default ({ app, $config: { axios } }: Context, inject: Function) => {
  SDK.setBaseUrl(axios.baseURL)

  app.$merkaly = new SDK.Admin()
  inject('merkaly', app.$merkaly)

  return app.$merkaly
}
