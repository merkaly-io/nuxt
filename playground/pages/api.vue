<script lang="ts" setup>
const { $api } = useNuxtApp();

function log() {
  console.log('$api', $api);
  return $api();
}
</script>

<template>
  <BButton @click="log">Log Api</BButton>
</template>
