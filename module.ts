import { Module } from '@nuxt/types'
import { NuxtOptionsBuild } from '@nuxt/types/config/build'
import chalk from 'chalk'
import { join } from 'path'
import packageJson from './package.json'

export interface MerkalyParams {
  BASE_DOMAIN: string
  TAG_MANAGER_ID?: string
  SENTRY_DSN?: string
}

const MerkalyModule: Module<MerkalyParams> = function (params: MerkalyParams) {
  const { nuxt, options } = this

  // @ts-ignore
  const runtimeVars: MerkalyParams = { ...params, ...(options.publicRuntimeConfig.merkaly || {}) }
  // @ts-ignore
  options.publicRuntimeConfig.merkaly = runtimeVars

  // @ts-ignore
  options.publicRuntimeConfig.gtm = {
    id: runtimeVars.TAG_MANAGER_ID,
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
      dsn: runtimeVars.SENTRY_DSN,
      disabled: Boolean(runtimeVars.SENTRY_DSN)
    }
  })

  if (runtimeVars.TAG_MANAGER_ID) {
    this.addPlugin({ src: require.resolve(join(__dirname, '/plugins/gtm')) })
    this.addModule({
      src: '@nuxtjs/gtm',
      options: {
        id: runtimeVars.TAG_MANAGER_ID,
        respectDoNotTrack: false
      }
    })
  }

  if (runtimeVars.BASE_DOMAIN) {
    this.addModule({
      src: '@nuxtjs/sitemap',
      options: { gzip: true }
    })

    this.addModule({
      src: '@nuxtjs/robots',
      options: { sitemap: `https://${runtimeVars.BASE_DOMAIN}/sitemap.xml` }
    })
  }

  this.addModule({ src: '@nuxt/typescript-build' })
  this.addModule({ src: '@nuxtjs/stylelint-module' })
  this.addModule({ src: '@nuxtjs/pwa' })
  this.addModule({ src: '@nuxtjs/axios' })
  this.addModule({ src: 'vue-toastification/nuxt' })
  this.addModule({ src: 'vue-sweetalert2/nuxt' })

  options.build.corejs = 3

  nuxt.hook('listen', () => {
    const merkaly = chalk.underline.redBright('Merkaly')
    const arrow = chalk.redBright('->')

    options.cli.badgeMessages.push(`${merkaly}: @v${packageJson.version}`)

    if (runtimeVars.BASE_DOMAIN) {
      options.cli.badgeMessages.push(`${arrow} DOMAIN: https://${runtimeVars.BASE_DOMAIN}`)
    }
  })
}

export default MerkalyModule
