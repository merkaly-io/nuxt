import { Context } from '@nuxt/types'

export default ({ $auth, $sentry, $config: { merkaly } }: Context) => {
  if (!merkaly) {
    return
  }

  const options: any = $auth.strategy.options

  options.clientId = merkaly.AUTH_CLIENT_ID
  options.domain = merkaly.AUTH_CLIENT_ID
  options.endpoints = {
    authorization: `https://${merkaly.AUTH_DOMAIN}/authorize`,
    logout: `https://${merkaly.AUTH_DOMAIN}/v2/logout`,
    token: `https://${merkaly.AUTH_DOMAIN}/oauth/token`,
    userInfo: `https://${merkaly.AUTH_DOMAIN}/userinfo`
  }

  if ($auth.loggedIn && merkaly.SENTRY_DSN) {
    $sentry.setUser({ email: String($auth.user?.name), id: String($auth.user?.sub) })
  }
}
