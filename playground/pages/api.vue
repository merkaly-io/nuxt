<script lang="ts" setup>
const { $api } = useNuxtApp();

const url = ref('/');

function log() {
  return $api(url.value, {
    onBeforeSend: (request) => console.log('onBeforeSend', request),
    onComplete: (response) => console.log('onComplete', response),
    onError: (reason) => console.log('onError', reason),
    onFatal: (reason) => console.log('onFatal', reason),
    onResponse: (response) => console.log('onResponse', response),
    onSuccess: (result) => console.log('onSuccess', result),
  });
}
</script>

<template>
  <BContainer>
    <BFormInput v-model="url" />

    <BButton @click="log()">Log Api</BButton>
  </BContainer>
</template>
