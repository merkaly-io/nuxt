import type { NuxtApp } from '#app';
import type { Ref } from '#imports';
import { useState } from '#imports';
import { until } from '@vueuse/core';
import { useAuth } from '../composables/useAuth';

export type BootstrapStage = 'organization' | 'me';

export type BootstrapStatus = 'idle' | 'pending' | 'success' | 'error';

export interface BootstrapError {
  message: string;
  status?: number;
}

interface AdapterLike<T> { // what withAdapter() returns
  data: Ref<T>;
  error: Ref<unknown>;
  execute: () => Promise<void>;
  loading: Ref<boolean>;
}

export type BootstrapLoader<T = unknown> = () => T | Promise<T> | AdapterLike<T>;

export interface BootstrapLoaders<TOrganization = unknown, TMe = unknown> {
  me?: BootstrapLoader<TMe>;
  organization?: BootstrapLoader<TOrganization>;
}

const inApp = <T>(nuxtApp: NuxtApp, fn: () => T) => nuxtApp.runWithContext(fn) as T; // sync composables only

const registry = new WeakMap<NuxtApp, BootstrapLoaders>(); // per app instance, safe across SSR requests

export const registerBootstrapLoaders = (nuxtApp: NuxtApp, loaders: BootstrapLoaders) => {
  registry.set(nuxtApp, { ...registry.get(nuxtApp), ...loaders });
};

export const useBootstrapState = <T>(stage: BootstrapStage) => ({
  data: useState<T | undefined>(`merkaly:${stage}:data`, () => undefined),
  error: useState<BootstrapError | undefined>(`merkaly:${stage}:error`, () => undefined),
  status: useState<BootstrapStatus>(`merkaly:${stage}:status`, () => 'idle'),
});

const isAdapter = <T>(value: unknown): value is AdapterLike<T> => Boolean(value && typeof value === 'object' && 'execute' in value && 'loading' in value);

const toError = (reason: unknown): BootstrapError => {
  const value = reason as { message?: unknown, status?: unknown, statusCode?: unknown } | undefined;

  return {
    message: String(value?.message || reason || 'Request failed'),
    status: Number(value?.statusCode ?? value?.status) || undefined,
  };
};

const resolveLoader = async <T>(nuxtApp: NuxtApp, loader: BootstrapLoader<T>): Promise<T> => {
  const result = await nuxtApp.runWithContext(loader);

  if (!isAdapter<T>(result)) return result;

  if (result.loading.value) await until(result.loading).toBe(false); // immediate adapter, already running
  else await result.execute();

  if (result.error.value) throw result.error.value; // adapters resolve on api errors

  return result.data.value;
};

export const runBootstrapStage = (nuxtApp: NuxtApp, stage: BootstrapStage, { force = false } = {}) => { // force: reload a resolved stage
  const loader = registry.get(nuxtApp)?.[stage];
  const { data, error, status } = inApp(nuxtApp, () => useBootstrapState(stage));

  if (!loader) return Promise.resolve(true);
  if (status.value === 'success' && !force) return Promise.resolve(true); // SSR payload or an earlier run

  status.value = 'pending';
  error.value = undefined;

  return resolveLoader(nuxtApp, loader)
    .then((value) => {
      data.value = value;
      status.value = 'success';

      return true;
    })
    .catch((reason) => {
      error.value = toError(reason);
      status.value = 'error';

      return false;
    });
};

export const runBootstrap = async (nuxtApp: NuxtApp) => { // after the session hooks: organization, then me
  const { error, fail, isAuthenticated, token } = inApp(nuxtApp, useAuth);

  if (error.value || nuxtApp.payload.error) return; // an earlier stage already failed

  const failStage = (stage: BootstrapStage) => {
    const reason = inApp(nuxtApp, () => useBootstrapState(stage)).error.value;

    return fail({ message: reason?.message || `${stage} failed`, stage, status: reason?.status });
  };

  if (!await runBootstrapStage(nuxtApp, 'organization')) return failStage('organization');

  if (!isAuthenticated.value || !token.value) return; // public visitor: no me

  if (!await runBootstrapStage(nuxtApp, 'me')) return failStage('me');
};
