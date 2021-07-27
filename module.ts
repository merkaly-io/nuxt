import * as path from 'path'
import SDK from '@merkaly/sdk-js'
import { Module } from '@nuxt/types'
import { NuxtOptionsBuild } from '@nuxt/types/config/build'
import { NuxtOptionsPlugin } from '@nuxt/types/config/plugin'
import chalk from 'chalk'
import packageJson from './package.json'

export interface MerkalyParams {
  baseUrl: string
  AUTH_ANONYMOUS: boolean
  AUTH_DOMAIN: string
  AUTH_CLIENT_ID: string
  AUTH_PLUGINS: NuxtOptionsPlugin[]
  AUTH_REDIRECT: Record<string, any>
  GOOGLE_TM?: Record<string, any>
  SENTRY_DSN?: string
}

const MerkalyModule: Module<MerkalyParams> = function (params) {
  const { nuxt, options } = this

  // @ts-ignore
  const runtimeVars: MerkalyParams = { ...params, ...(options.publicRuntimeConfig.merkaly || {}) }
  // @ts-ignore
  options.publicRuntimeConfig.merkaly = runtimeVars

  SDK.setBaseUrl(runtimeVars.baseUrl)

  this.addPlugin({ src: require.resolve(path.join(__dirname, '/plugins/path')), mode: 'all' })
  this.addPlugin({ src: require.resolve(path.join(__dirname, '/plugins/merkaly')), mode: 'all' })

  const build: NuxtOptionsBuild = options.build || []
  const transpile = build.transpile || []

  transpile.push('@merkaly/sdk-js')
  transpile.push('@merkaly/api')
  build.transpile = transpile

  this.addModule({ src: '@nuxtjs/pwa', options: {} })
  this.addModule({ src: '@nuxtjs/gtm', options: runtimeVars.GOOGLE_TM })
  this.addModule({ src: '@nuxtjs/axios', options: {} })
  this.addModule({ src: '@nuxtjs/sentry', options: { dsn: runtimeVars.SENTRY_DSN } })
  this.addModule({ src: 'bootstrap-vue/nuxt', options: { bootstrapCSS: false, bootstrapVueCSS: true } })
  this.addModule({ src: 'vue-toastification/nuxt', options: {} })
  this.addModule({ src: 'vue-sweetalert2/nuxt', options: {} })

  const authPlugins = runtimeVars.AUTH_PLUGINS || []
  authPlugins.push(...[
    { src: require.resolve(path.join(__dirname, '/plugins/sentry')), ssr: false },
    { src: require.resolve(path.join(__dirname, '/plugins/lock')), ssr: false }
  ])

  this.addModule({
    src: require.resolve('@nuxtjs/auth-next'),
    options: {
      redirect: runtimeVars.AUTH_REDIRECT || {},
      plugins: authPlugins,
      strategies: {
        auth0: {
          domain: runtimeVars.AUTH_DOMAIN,
          clientId: runtimeVars.AUTH_CLIENT_ID
        }
      }
    }
  })

  if (!runtimeVars.AUTH_ANONYMOUS) {
    let middleware = options.router.middleware || []

    if (typeof middleware === 'string') {
      middleware = middleware.split(' ')
    }

    middleware.push('auth')

    options.router.middleware = middleware
  }
  options.build.corejs = 3

  nuxt.hook('listen', () => {
    options.cli.badgeMessages.push(chalk.underline.redBright('Merklay') + `: @v${packageJson.version}`)
  })
}

export default MerkalyModule
