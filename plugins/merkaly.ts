import { Context } from '@nuxt/types'
import * as Merkaly from '@sk-merkaly/sdk-js/src/app'

export interface MerkalyInterface {
  account: Merkaly.Account
  admin: Merkaly.Admin
  cloud: Merkaly.Cloud
  client: Merkaly.MerkalyClient
}

export default ({ app, $config }: Context, inject: Function) => {
  app.$merkaly = {
    account: new Merkaly.Account(),
    admin: new Merkaly.Admin(),
    cloud: new Merkaly.Cloud(),
    client: new Merkaly.MerkalyClient()
  }
  inject('merkaly', app.$merkaly)

  return app.$merkaly
}
