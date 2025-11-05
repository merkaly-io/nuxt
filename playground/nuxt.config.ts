export default defineNuxtConfig({

  css: ['bootstrap/dist/css/bootstrap.min.css'],

  devtools: { enabled: true },

  modules: ['../src/module'],

  merkaly: {
    baseUrl: process.env.BASE_URL,
    auth0: {
      callback: '/auth',
      client: process.env.AUTH0_CLIENT,
      domain: process.env.AUTH0_DOMAIN,
      params: {},
    },
  },
});
