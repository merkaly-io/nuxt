import { NuxtConfig } from '@nuxt/types'
import MerkalyModule from './module'

const config: NuxtConfig = {

  target: 'server',

  plugins: [],

  modules: [
    [MerkalyModule, {
      BASE_DOMAIN: process.env.BASE_DOMAIN,
      TAG_MANAGER_ID: process.env.TAG_MANAGER_ID,
      SENTRY_DSN: process.env.SENTRY_DSN
    }]
  ]

}

export default config
