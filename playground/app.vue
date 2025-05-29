<script lang="ts" setup>
import { useApi } from '../src/runtime/composables/useApi.js'

const { data, loading, execute } = useApi<unknown[]>('https://jsonplaceholder.typicode.com/posts')
</script>

<template>
  <div>
    <pre v-text="{ data: data.length, loading }" />

    <button @click="execute">
      <span>Fetch Posts</span>
    </button>
  </div>
</template>
