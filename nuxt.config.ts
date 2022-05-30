import { NuxtConfig } from '@nuxt/types/config'
import { MerkalyNuxt } from './nuxt'

const config: NuxtConfig = {

  target: 'server',

  plugins: [],

  modules: [
    [MerkalyNuxt, {
      BASE_DOMAIN: process.env.BASE_DOMAIN,
      TAG_MANAGER_ID: process.env.TAG_MANAGER_ID,
      SENTRY_DSN: process.env.SENTRY_DSN
    }]
  ]

}

export default config
