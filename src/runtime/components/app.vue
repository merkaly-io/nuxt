<script lang="ts" setup>
import { onBeforeMount, callOnce, useNuxtApp, useAuth } from '#imports';

const { $auth0 } = useNuxtApp();
const { isLoading } = useAuth();

onBeforeMount(() => callOnce(() => $auth0.checkSession()));
</script>

<template>
  <slot v-if="!isLoading">
    <NuxtPage />
  </slot>
</template>
