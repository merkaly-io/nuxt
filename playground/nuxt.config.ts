export default defineNuxtConfig({

  css: ['bootstrap/dist/css/bootstrap.min.css'],

  devtools: { enabled: true },

  modules: ['../src/module'],

  merkaly: {
    auth0: {
      client: 'randomAuth0Client',
      domain: 'randomAuth0Domain',
      callback: '/auth',
      params: {},
    },
  },
});
