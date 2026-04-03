import { defineNuxtPlugin } from '#app';
import { setUser } from '@sentry/nuxt';

export default defineNuxtPlugin(async ({ hook }) => {
  hook('merkaly:auth', (user) => {
    return setUser(user ? {
      id: user.sub,
      email: user.email,
      username: user.name,
    } : null);
  });
});
