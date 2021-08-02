import SDK from '@merkaly/sdk-js'
import { Context } from '@nuxt/types'

export default ({ $config: { merkaly } }: Context) => SDK.setBaseUrl(String(merkaly?.baseUrl))
