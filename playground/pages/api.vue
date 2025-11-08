<script lang="ts" setup>
const { $api } = useNuxtApp();

const url = ref('/');

const { data, loading, execute } = useApi(() => ({
  default: () => [],
  onBeforeSend: (request) => console.log('useApi onBeforeSend', request),
  onComplete: (response) => console.log('useApi onComplete', response),
  onError: (reason) => console.log('useApi onError', reason),
  onFatal: (reason) => console.log('useApi onFatal', reason),
  onResponse: (response) => console.log('useApi onResponse', response),
  onSuccess: (result) => console.log('useApi onSuccess', result),
  prefix: '/www',
  uri: '/stripe/plans',
}));

function fastApi() {
  return $api(url.value, {
    onBeforeSend: (request) => console.log('$api onBeforeSend', request),
    onComplete: (response) => console.log('$api onComplete', response),
    onError: (reason) => console.log('$api onError', reason),
    onFatal: (reason) => console.log('$api onFatal', reason),
    onResponse: (response) => console.log('$api onResponse', response),
    onSuccess: (result) => console.log('$api onSuccess', result),
  });
}
</script>

<template>
  <BContainer>
    <BFormInput v-model="url" />

    <BButton @click="fastApi()">fastApi</BButton>

    <BButton :disabled="loading" @click="execute()">useApi</BButton>
  </BContainer>
</template>
