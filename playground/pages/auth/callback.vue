<script lang="ts" setup>
const { $auth0 } = useNuxtApp();

onBeforeMount(() => $auth0.handleRedirectCallback()
  .then(({ appState }) => location.href = (appState.target || '/'))
  .catch(() => location.href = '/'));
</script>

<template>
  <div>Loading…</div>
</template>
