import type { User } from '@auth0/auth0-spa-js'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { useStorage } from '@vueuse/core'

const token = useStorage<string>('auth.token', '')
const user = ref<User>({} as User)
const organization = ref()
const roles = ref([])
const permissions = ref([])
const isLoading = ref(true)

export function useAuth() {
  const { public: $config } = useRuntimeConfig()

  const auth0 = new Auth0Client({
    domain: $config.AUTH0.domain,
    clientId: $config.AUTH0.clientId,
    authorizationParams: {
      redirect_uri: window.location.origin.concat('/auth'),
    },
  })

  const isAuthenticated = computed(() => Boolean(token.value && user.value?.sub))

  async function checkOrganization(newToken: string) {
    // isLoading.value = true;
    token.value = newToken

    // await $api('/auth/organization')
    //   .then((value) => {
    //     organization.value = value;
    //
    //     if (!user.value) {
    //       return;
    //     }
    //
    //     user.value.org_id = organization.value?._id;
    //   })
    //   .finally(() => (isLoading.value = false));
  }

  async function checkSession() {
    await auth0.checkSession()

    await auth0.getIdTokenClaims().then(claims => (token.value = claims?.__raw))

    await auth0.getUser().then(value => (user.value = value))

    if (!token.value) {
      return login()
    }

    isLoading.value = false

    // return checkOrganization(token.value);
  }

  async function switchOrganization() {
    await auth0.getTokenWithPopup().then((value) => {
      value && checkOrganization(value)
    })

    return navigateTo('/')
  }

  async function handleRedirect() {
    await auth0.handleRedirectCallback()
    await checkSession()

    return navigateTo('/')
  }

  function login() {
    return auth0.loginWithRedirect()
  }

  function logout() {
    return auth0.logout({ logoutParams: { returnTo: window.origin } })
  }

  return {
    checkSession,
    handleRedirect,
    isAuthenticated,
    isLoading,
    login,
    logout,
    organization,
    permissions,
    roles,
    switchOrganization,
    token,
    user,
  }
}
