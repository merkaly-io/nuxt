import { Context } from '@nuxt/types'

export default ({ $auth, $config: { merkaly } }: Context) => {
  const options: any = $auth.strategy.options

  options.clientId = merkaly.AUTH_CLIENT_ID
  options.domain = merkaly.AUTH_CLIENT_ID
  options.endpoints = {
    authorization: `https://${merkaly.AUTH_DOMAIN}/authorize`,
    logout: `https://${merkaly.AUTH_DOMAIN}/v2/logout`,
    token: `https://${merkaly.AUTH_DOMAIN}/oauth/token`,
    userInfo: `https://${merkaly.AUTH_DOMAIN}/userinfo`
  }
}
