import { Module } from '@nuxt/types'
import { ModuleThis } from '@nuxt/types/config/module'
import chalk from 'chalk'
import { resolve } from 'path'

const nuxtModule: Module<ModuleThis> = function () {
  const { nuxt, options } = this

  this.addPlugin(resolve(__dirname, 'src/plugins/path.ts'))

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push('Merklay: @v', chalk.underline.redBright(process.env.npm_package_version))
  })

}

export default nuxtModule
