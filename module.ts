import * as path from 'path'
import { Module } from '@nuxt/types'
import { NuxtOptionsBuild } from '@nuxt/types/config/build'
import { NuxtOptionsPlugin } from '@nuxt/types/config/plugin'
import chalk from 'chalk'
import packageJson from './package.json'

export interface MerkalyParams {
  baseUrl: string
  AUTH_ANONYMOUS: boolean
  AUTH_PLUGINS: NuxtOptionsPlugin[]
  AUTH_REDIRECT: Record<string, any>
  GOOGLE_TM?: Record<string, any>
  SENTRY_DSN?: string
}

const MerkalyModule: Module<MerkalyParams> = function (params) {
  const { nuxt, options } = this

  this.addPlugin({ src: require.resolve(path.join(__dirname, '/plugins/path')), mode: 'all' })
  this.addPlugin({
    src: require.resolve(path.join(__dirname, '/plugins/merkaly')),
    mode: 'all',
    options: {
      dsn: params.baseUrl,
      debug: process.env.NODE_ENV !== 'production'
    }
  })

  const build: NuxtOptionsBuild = options.build || []
  const transpile = build.transpile || []
  transpile.push('@sk-merkaly/sdk-js')
  build.transpile = transpile

  this.addModule({
    src: '@nuxtjs/pwa',
    options: {}
  })

  this.addModule({
    src: '@nuxtjs/gtm',
    options: params.GOOGLE_TM
  })

  this.addModule({
    src: 'vue-toastification/nuxt',
    options: {}
  })

  this.addModule({
    src: 'vue-sweetalert2/nuxt',
    options: {}
  })

  this.addModule({
    src: '@nuxtjs/axios',
    options: {}
  })

  this.addModule({
    src: '@nuxtjs/sentry',
    options: {
      dsn: params.SENTRY_DSN
    }
  })

  this.addModule({
    src: 'bootstrap-vue/nuxt',
    options: { bootstrapCSS: false, bootstrapVueCSS: true }
  })

  const authPlugins = params.AUTH_PLUGINS || []
  authPlugins.push({ src: require.resolve(path.join(__dirname, '/plugins/sentry')), ssr: false })

  this.addModule({
    src: require.resolve('@nuxtjs/auth-next'),
    options: {
      redirect: params.AUTH_REDIRECT || {},
      plugins: authPlugins,
      strategies: {
        local: {
          token: {
            property: 'accessToken',
            required: true,
            type: 'Bearer'
          },
          user: {
            property: false,
            autoFetch: true
          },
          endpoints: {
            login: { baseURL: params.baseUrl, url: '/auth/login', method: 'post' },
            logout: { baseURL: params.baseUrl, url: '/auth/logout', method: 'post' },
            user: { baseURL: params.baseUrl, url: '/auth/user', method: 'get' }
          }
        }
      }
    }
  })

  if (!params.AUTH_ANONYMOUS) {
    let middleware = options.router.middleware || []

    if (typeof middleware === 'string') {
      middleware = middleware.split(' ')
    }

    middleware.push('auth')

    options.router.middleware = middleware
  }

  nuxt.hook('listen', () => {
    options.cli.badgeMessages.push(chalk.underline.redBright('Merklay') + `: @v${packageJson.version}`)
  })
}

export default MerkalyModule
