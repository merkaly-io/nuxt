import { Module } from '@nuxt/types'
import { NuxtOptionsPlugin } from '@nuxt/types/config/plugin'
import chalk from 'chalk'
import packageJson from '../package.json'

interface MerkalyParams {
  baseURL: string
  AUTH_DOMAIN: string
  AUTH_CLIENT: string
  AUTH_PLUGINS: NuxtOptionsPlugin[]
  AUTH_REDIRECT: Record<string, any>
  SENTRY_DSN?: string
}

const MerkalyModule: Module<MerkalyParams> = function (params) {
  const { nuxt, options } = this

  this.addPlugin({ src: require.resolve(__dirname + '/plugins/path') })
  this.addPlugin({ src: require.resolve(__dirname + '/plugins/auth0') })

  this.addModule({
    src: '@nuxtjs/pwa',
    options: {}
  })

  this.addModule({
    src: '@nuxtjs/sentry',
    options: {
      dsn: params.SENTRY_DSN
    }
  })

  const authPlugins = params.AUTH_PLUGINS || []
  authPlugins.push({ src: require.resolve(__dirname + '/plugins/sentry'), ssr: false })

  this.addModule({
    src: require.resolve('@nuxtjs/auth-next'),
    options: {
      redirect: params.AUTH_REDIRECT || {},
      strategies: { auth0: { domain: params.AUTH_DOMAIN, clientId: params.AUTH_CLIENT } },
      plugins: authPlugins
    }
  })

  let middleware = options.router.middleware || []

  if (typeof middleware === 'string') {
    middleware = middleware.split(' ')
  }

  middleware.push('auth')

  options.router.middleware = middleware

  // @ts-ignore
  let auth0Config = options.publicRuntimeConfig.auth0 || {}
  auth0Config = { ...{ AUTH0_DOMAIN: params.AUTH_DOMAIN, AUTH0_CLIENT: params.AUTH_CLIENT }, ...auth0Config }

  // @ts-ignore
  options.publicRuntimeConfig.auth0 = auth0Config

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push(chalk.underline.redBright('Merklay') + `: @v${packageJson.version}`)
  })

}

export default MerkalyModule
