import { Module } from '@nuxt/types'
import { ModuleThis } from '@nuxt/types/config/module'
import chalk from 'chalk'
import path from 'path'
import packageJson from '../package.json'

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
  this.addPlugin({
    src: path.resolve(__dirname, './plugins/path.js')
  })

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push(chalk.underline.redBright('Merklay') + `: @v${packageJson.version}`)
  })

}

export default nuxtModule
