import type { Plugin } from '#app';
import { defineNuxtPlugin } from '#imports';
import { runBootstrap } from '../internal/bootstrap';

const plugin: Plugin = defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:created', () => runBootstrap(nuxtApp)); // SSR: organization in the HTML, no session so no me
});

export default plugin;
