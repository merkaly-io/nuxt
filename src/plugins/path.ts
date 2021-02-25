import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'

export default ({ app }: Context, inject: Inject): Function => {
  app.$path = (name: String, params: Object = {}): Object => ({ name, params })
  inject('path', app.$path)

  return app.$path
}
