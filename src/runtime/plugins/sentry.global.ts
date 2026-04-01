import { defineNuxtPlugin } from '#app';
import { setUser } from '@sentry/nuxt';

export default defineNuxtPlugin(async ({ hook }) => {
  hook('merkaly:auth', (user) => {
    if (!user) {
      return setUser(null);
    }

    return setUser({
      id: user.sub,
      email: user.email,
      username: user.name,
    });
  });
});
