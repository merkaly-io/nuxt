import { Context } from '@nuxt/types'

export default ({ app, $config }: Context, inject: Function) => {
  app.$merkaly = $config.merkaly
  inject('merkaly', app.$merkaly)

  return app.$merkaly
}
