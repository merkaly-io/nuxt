import { Context } from '@nuxt/types'
import Auth0Lock from 'auth0-lock'

declare module '@nuxtjs/auth-next' {
  interface Auth {
    $lock: typeof Auth0Lock
  }
}

export default function ({ $auth, $config: { merkaly } }: Context) {
  if (merkaly?.AUTH_DOMAIN && merkaly.AUTH_DOMAIN) {
    $auth.$lock = new Auth0Lock(merkaly.AUTH_CLIENT_ID, merkaly.AUTH_DOMAIN)
  }

  return $auth
}
