import { Module } from '@nuxt/types'
import { NuxtOptionsBuild } from '@nuxt/types/config/build'
import { join } from 'path'

export interface MerkalyParams {
  BASE_DOMAIN: string
  TAG_MANAGER_ID?: string
  SENTRY_DSN?: string
}

const MerkalyModule: Module<MerkalyParams> = function (params: MerkalyParams) {
  const {
    nuxt,
    options
  } = this

  // @ts-ignore
  options.publicRuntimeConfig.gtm = {
    id: params.TAG_MANAGER_ID,
    // @ts-ignore
    ...options.publicRuntimeConfig.gtm
  }

  this.addPlugin({
    src: require.resolve(join(__dirname, '/plugins/path')),
    mode: 'all'
  })

  const build: NuxtOptionsBuild = options.build || []
  const transpile = build.transpile || []

  transpile.push('@merkaly/sdk-js')
  transpile.push('@merkaly/api')
  build.transpile = transpile

  this.addModule({
    src: '@nuxtjs/sentry',
    options: {
      dsn: params.SENTRY_DSN,
      disabled: Boolean(params.SENTRY_DSN)
    }
  })

  if (params.TAG_MANAGER_ID) {
    this.addPlugin({ src: require.resolve(join(__dirname, '/plugins/gtm')) })
    this.addModule({
      src: '@nuxtjs/gtm',
      options: {
        id: params.TAG_MANAGER_ID,
        respectDoNotTrack: false
      }
    })
  }

  if (params.BASE_DOMAIN) {
    this.addModule({
      src: '@nuxtjs/sitemap',
      options: { gzip: true }
    })

    this.addModule({
      src: '@nuxtjs/robots',
      options: { sitemap: `https://${params.BASE_DOMAIN}/sitemap.xml` }
    })
  }

  this.addModule({ src: '@nuxt/typescript-build' })
  // this.addModule({ src: '@nuxtjs/stylelint-module' })
  this.addModule({ src: '@nuxtjs/pwa' })
  this.addModule({ src: 'vue-toastification/nuxt' })
  this.addModule({ src: 'vue-sweetalert2/nuxt' })

  options.build.corejs = 3
  options.build.standalone = true

  nuxt.hook('listen', () => {
    if (params.BASE_DOMAIN) {
      options.cli.badgeMessages.push(`-> DOMAIN: https://${params.BASE_DOMAIN}`)
    }
  })
}

export default MerkalyModule
