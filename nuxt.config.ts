import MerkalyModule from './src/module'
import { NuxtConfig } from '@nuxt/types'

const config: NuxtConfig = {

  target: 'server',

  buildModules: ['@nuxt/typescript-build'],

  modules: [
    [MerkalyModule, {
      GOOGLE_TM: {
        id: process.env.GOOGLE_TM,
        enabled: true
      },
      SENTRY_DSN: process.env.SENTRY_DSN,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      AUTH_CLIENT: process.env.AUTH_CLIENT,
      AUTH_ANONYMOUS: true,
      AUTH_REDIRECT: {
        login: '/auth/login',
        logout: '/auth/logout',
        callback: '/auth/callback',
        home: '/'
      }
    }]
  ]

}

export default config
