import { Context } from '@nuxt/types'

export default function ({ $auth, $sentry }: Context) {

  if ($auth.loggedIn) {
    $sentry.setUser({ email: String($auth.user?.name), id: String($auth.user?.sub) })
  }

  return $auth.user
}
