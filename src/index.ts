import { Module } from '@nuxt/types'
import { WebAuth } from 'auth0-js'
import chalk from 'chalk'
import path from 'path'
import packageJson from '../package.json'

export interface MerkalyNuxt {
  $path (name: String, params?: Record<string, any>): Object

  $auth0: WebAuth
}

declare module 'vue/types/vue' {
  interface Vue extends MerkalyNuxt {
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions extends MerkalyNuxt {
  }

  interface Context extends MerkalyNuxt {
  }
}

declare module 'vuex/types/index' {
  interface Store<S> extends MerkalyNuxt {
  }
}

interface MerkalyParams {
  baseURL: string
  AUTH0_DOMAIN: string
  AUTH0_CLIENT: string
}

const nuxtModule: Module<MerkalyParams> = function (params) {
  const { nuxt, options } = this

  this.addPlugin(
    { src: path.resolve(__dirname, './plugins/path.js') },
    { src: path.resolve(__dirname, './plugins/auth0.js') },
  )

  // @ts-ignore
  options.publicRuntimeConfig.auth0 = {
    AUTH0_DOMAIN: params.AUTH0_DOMAIN,
    AUTH0_CLIENT: params.AUTH0_CLIENT
  }

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push(chalk.underline.redBright('Merklay') + `: @v${packageJson.version}`)
  })

}

export default nuxtModule
