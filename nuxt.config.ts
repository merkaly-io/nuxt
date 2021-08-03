import { NuxtConfig } from '@nuxt/types'
import MerkalyModule from './module'

const config: NuxtConfig = {

  target: 'server',

  plugins: [
    '@/plugins/merkaly'
  ],

  modules: [
    [MerkalyModule, {
      baseUrl: process.env.baseUrl,
      AUTH_DOMAIN: process.env.AUTH_DOMAIN,
      AUTH_CLIENT_ID: process.env.AUTH_CLIENT_ID,
      TAG_MANAGER_ID: process.env.TAG_MANAGER_ID,
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
