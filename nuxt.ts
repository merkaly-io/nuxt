import { NuxtConfig } from '@nuxt/types/config'

export const defineConfig = (extendedConfig: NuxtConfig): NuxtConfig => {
  const mainConfig: NuxtConfig = ({
    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ]
    },

    publicRuntimeConfig: {
      baseUrl: String(process.env.BASE_URL)
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [],

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
      // https://go.nuxtjs.dev/typescript
      ['@nuxt/typescript-build', {}],
      // https://go.nuxtjs.dev/stylelint
      ['@nuxtjs/stylelint-module', {}]
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
      // https://pwa.nuxtjs.org/
      ['@nuxtjs/pwa', {}],
      // https://axios.nuxtjs.org/
      ['@nuxtjs/axios', {}],
      // https://content.nuxtjs.org/
      ['@nuxt/content', {}],
      // https://sentry.nuxtjs.org/
      ['@nuxtjs/sentry', { disabled: Boolean(!process.env.SENTRY_DSN) }],
      // https://github.com/nuxt-community/moment-module/
      ['@nuxtjs/moment', {}],
      // https://auth.nuxtjs.org/
      ['@nuxtjs/auth-next', {}]
    ],

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {
      // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
      baseURL: String(process.env.BASE_URL)
    },

    // PWA module configuration: https://go.nuxtjs.dev/pwa
    pwa: {
      manifest: {
        lang: 'en'
      }
    },

    // Content module configuration: https://go.nuxtjs.dev/config-content
    content: {},

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
      standalone: true,
      babel: {
        compact: true
      }
    }
  })

  mainConfig.head = { ...extendedConfig.head, ...mainConfig.head }
  extendedConfig.modules && mainConfig.modules?.push(...extendedConfig.modules)
  extendedConfig.buildModules && mainConfig.buildModules?.push(...extendedConfig.buildModules)

  return mainConfig
}
