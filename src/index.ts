import { Module } from '@nuxt/types'
import chalk from 'chalk'
import path from 'path'
import packageJson from '../package.json'

interface MerkalyParams {
  baseURL: string
  AUTH0_DOMAIN: string
  AUTH0_CLIENT: string
}

const nuxtModule: Module<MerkalyParams> = function (params) {
  const { nuxt, options } = this

  this.addPlugin(
    { src: path.resolve(__dirname, './plugins/path.js') },
    { src: path.resolve(__dirname, './plugins/auth0.js') }
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
