import { Module } from '@nuxt/types'
import { ModuleThis } from '@nuxt/types/config/module'
import chalk from 'chalk'
import { resolve } from 'path'

export interface NuxtPluginPath {
  $path (name: String, params?: Record<string, any>): Object
}

declare module 'vue/types/vue' {
  interface Vue extends NuxtPluginPath {
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions extends NuxtPluginPath {
  }

  interface Context extends NuxtPluginPath {
  }
}

declare module 'vuex/types/index' {
  interface Store<S> extends NuxtPluginPath {
  }
}

const nuxtModule: Module<ModuleThis> = function () {
  const { nuxt, options } = this

  this.addPlugin(resolve(__dirname, 'src/plugins/path.ts'))

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push('Merklay: @v', chalk.underline.redBright(process.env.npm_package_version))
  })

}

export default nuxtModule
