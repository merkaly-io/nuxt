import { Module } from '@nuxt/types'
import { ModuleThis } from '@nuxt/types/config/module'
import chalk from 'chalk'
import packageJson from '../package.json'
import pluginPath from './plugins/path'

export interface MerkalyNuxt {
  $path (name: String, params?: Record<string, any>): Object
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

const nuxtModule: Module<ModuleThis> = function () {
  const { nuxt, options } = this
  this.addPlugin(pluginPath)

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push(`Merklay: @v${chalk.underline.redBright(packageJson.version)}`)
  })

}

export default nuxtModule
