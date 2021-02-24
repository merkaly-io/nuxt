import { Context } from '@nuxt/types'

export default ({ app }: Context, inject: Function): Function => {
  app.$path = (name: String, params: Object = {}): Object => ({ name, params })
  inject('path', app.$path)

  return app.$path
}
