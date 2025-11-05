<script lang="ts" setup>
const $auth = useAuth();
</script>

<template>
  <pre v-text="$auth" />

  <BButton @click="$auth.login()">Login</BButton>
</template>
