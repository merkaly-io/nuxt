import { Module } from '@nuxt/types'
import { NuxtOptionsPlugin } from '@nuxt/types/config/plugin'
import chalk from 'chalk'
import packageJson from '../package.json'

interface MerkalyParams {
  baseURL: string
  AUTH_DOMAIN: string
  AUTH_CLIENT: string
  AUTH_PLUGINS: NuxtOptionsPlugin[]
}

const nuxtModule: Module<MerkalyParams> = function (params) {
  const { nuxt, options } = this

  this.addPlugin({ src: require.resolve(__dirname + '/plugins/path.js') })
  this.addPlugin({ src: require.resolve(__dirname + '/plugins/auth0.js') })

  this.addModule({ src: require.resolve('@nuxtjs/pwa'), options: {} })
  this.addModule({
    src: require.resolve('@nuxtjs/auth-next'),
    options: {
      plugins: params.AUTH_PLUGINS || [],
      strategies: { auth0: { domain: params.AUTH_DOMAIN, clientId: params.AUTH_CLIENT } }
    }
  })

  // @ts-ignore
  options.publicRuntimeConfig.auth0 = {
    AUTH0_DOMAIN: params.AUTH_DOMAIN,
    AUTH0_CLIENT: params.AUTH_CLIENT
  }

  nuxt.hook('listen', async () => {
    options.cli.badgeMessages.push(chalk.underline.redBright('Merklay') + `: @v${packageJson.version}`)
  })

}

export default nuxtModule
