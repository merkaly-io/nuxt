<script lang="ts" setup>
import { useApi } from '#imports';

const { $api } = useNuxtApp();

const url = ref('/');

const { data, loading, execute } = useApi((params) => ({
  default: () => [],
  onBeforeSend: () => console.log('useApi onBeforeSend', params),
  prefix: '/www',
  uri: '/stripe/plans',
  method: 'GET',
  query: params,
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

    <BButton :disabled="loading" @click="execute({ id: 'con_id123' })">useApi</BButton>

    <pre v-text="{ data, loading }" />
  </BContainer>
</template>
