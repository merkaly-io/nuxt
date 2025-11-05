<script lang="ts" setup>
const { $api } = useNuxtApp();

function log() {
  return $api();
}
</script>

<template>
  <BButton @click="log">Log Api</BButton>
</template>
