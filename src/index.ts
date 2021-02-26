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

const nuxtModule: Module<MerkalyParams> = function (params) {
  const { nuxt, options } = this

  this.addPlugin({ src: require.resolve(__dirname + '/plugins/path') })
  this.addPlugin({ src: require.resolve(__dirname + '/plugins/auth0') })

  this.addModule({ src: require.resolve('@nuxtjs/pwa'), options: {} })

  this.addModule({
    src: require.resolve('@nuxtjs/sentry'),
    options: {
      dsn: params.SENTRY_DSN
    }
  })

  this.addModule({
    src: require.resolve('@nuxtjs/auth-next'),
    options: {
      redirect: params.AUTH_REDIRECT || {},
      strategies: { auth0: { domain: params.AUTH_DOMAIN, clientId: params.AUTH_CLIENT } },
      plugins: [
        ...[params.AUTH_PLUGINS || []],
        ...[{ src: '@/plugins/sentry', ssr: false }]
      ]
    }
  })

  let middleware = options.router.middleware || []

  if (typeof middleware === 'string') {
    middleware = middleware.split(' ')
  }

  middleware.push('auth')

  options.router.middleware = middleware

  // @ts-ignore
  options.publicRuntimeConfig.auth0 = {
    AUTH0_DOMAIN: params.AUTH_DOMAIN,
    AUTH0_CLIENT: params.AUTH_CLIENT
  }

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push(chalk.underline.redBright('Merklay') + `: @v${packageJson.version}`)
  })

}

export default nuxtModule
