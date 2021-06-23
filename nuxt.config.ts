import { NuxtConfig } from '@nuxt/types'
import MerkalyModule from './module'

const config: NuxtConfig = {

  target: 'server',

  buildModules: ['@nuxt/typescript-build'],

  modules: [
    [MerkalyModule, {
      baseUrl: process.env.baseUrl,
      GOOGLE_TM: { id: process.env.GOOGLE_TM, enabled: true },
      SENTRY_DSN: process.env.SENTRY_DSN,
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
