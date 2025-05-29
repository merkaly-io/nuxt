export default defineNuxtConfig({

  compatibilityDate: '2025-05-29',

  devtools: { enabled: true },

  future: {
    compatibilityVersion: 4,
  },

  merkaly: {
    apiUrl: 'https://api.merkaly.local',
  },

  modules: ['../src/module'],

  ssr: false,
})
