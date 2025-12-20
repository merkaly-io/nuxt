<script lang="ts" setup>
const { $auth0 } = useNuxtApp();
const $auth = useAuth();
const $route = useRoute();

function login() {
  return $auth0?.loginWithRedirect(({ appState: { target: $route.fullPath } }));
}
</script>

<template>
  <pre v-text="$auth" />

  <BButton variant="primary" @click="login()">Login</BButton>
</template>
