import { defineNuxtPlugin, useRuntimeConfig } from '#app';

export default defineNuxtPlugin(async (nuxtApp) => {
  const { public: $config } = useRuntimeConfig();

  const api = () => alert('hola');

  nuxtApp.provide('api', api);
});
