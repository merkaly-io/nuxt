import { Context } from '@nuxt/types'

export default ({ $config, $gtm }: Context | any) => $gtm.init($config.gtm.id)
