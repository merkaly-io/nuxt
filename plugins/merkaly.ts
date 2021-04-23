import { Context } from '@nuxt/types'
import Merkaly from '@sk-merkaly/sdk-js/app'

export default ({ app, $config, base }: Context, inject: Function) => {
  const dsn = '<%= options.dsn %>'
  app.$merkaly = new Merkaly(dsn)
  inject('merkaly', app.$merkaly)

  return app.$merkaly
}
