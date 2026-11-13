import type { NuxtApp } from '#app';
import { useAuth } from '../composables/useAuth';
import type { BootstrapStage } from './state';
import { inApp, runBootstrapStage, useBootstrapState } from './state';

export const runBootstrap = async (nuxtApp: NuxtApp) => { // after the session hooks: organization, then user
  const { error, fail, isAuthenticated, token } = await inApp(nuxtApp, useAuth);

  if (error.value || nuxtApp.payload.error) return; // an earlier stage already failed

  const failStage = async (stage: BootstrapStage) => {
    const reason = (await inApp(nuxtApp, () => useBootstrapState(stage))).error.value;

    return fail({ message: reason?.message || `${stage} failed`, stage, status: reason?.status });
  };

  if (!await runBootstrapStage(nuxtApp, 'organization')) return failStage('organization');

  if (!isAuthenticated.value || !token.value) return; // public visitor: no user

  if (!await runBootstrapStage(nuxtApp, 'user')) return failStage('user');
};
