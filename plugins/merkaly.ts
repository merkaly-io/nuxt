import { Context } from '@nuxt/types'
import Merkaly from '@sk-merkaly/sdk-js/app'

export default ({ app, $config }: Context, inject: Function) => {
  app.$merkaly = new Merkaly('')
  inject('merkaly', app.$merkaly)

  return app.$merkaly
}
