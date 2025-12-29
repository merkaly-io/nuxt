<script lang="ts" setup>
import { onBeforeMount, callOnce, useNuxtApp, useAuth } from '#imports';

const { $auth0 } = useNuxtApp();
const { isLoading } = useAuth();

onBeforeMount(() => callOnce(() => $auth0.checkSession()));
</script>

<template>
  <main>
    <NuxtRouteAnnouncer />
    <BOrchestrator />

    <slot v-if="isLoading" name="loading" />

    <slot v-else>
      <NuxtPage />
    </slot>
  </main>
</template>
