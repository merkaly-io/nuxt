<script setup>
import { MKApp } from '#components'
</script>

<template>
  <MKApp>
    <main class="min-vh-100">
      <h1 class="text-body">Nuxt module playground!</h1>

      <NuxtLayout>
        <BContainer>
          <NuxtPage />
        </BContainer>
      </NuxtLayout>
    </main>
  </MKApp>
</template>
