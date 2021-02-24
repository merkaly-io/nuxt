import { Context } from '@nuxt/types'
import { Inject } from '@nuxt/types/app'
import { WebAuth } from 'auth0-js'

export default ({ app, $config }: Context, inject: Inject): WebAuth => {
  app.$auth0 = new WebAuth({
    domain: String($config.auth0.AUTH0_DOMAIN),
    clientID: String($config.auth0.AUTH0_CLIENT)
  })
  inject('auth0', app.$auth0)

  return app.$auth0
}
