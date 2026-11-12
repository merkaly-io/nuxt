import type { NuxtApp } from '#app';
import type { Ref } from '#imports';
import { computed, useState } from '#imports';
import { until } from '@vueuse/core';

export interface MerkalyMe {} // eslint-disable-line @typescript-eslint/no-empty-object-type -- apps augment it

export interface MerkalyOrganization {} // eslint-disable-line @typescript-eslint/no-empty-object-type -- apps augment it

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

export interface BootstrapLoaders {
  me?: BootstrapLoader<MerkalyMe>;
  organization?: BootstrapLoader<MerkalyOrganization>;
}

interface StageData {
  me: MerkalyMe;
  organization: MerkalyOrganization;
}

export const inApp = <T>(nuxtApp: NuxtApp, fn: () => T) => nuxtApp.runWithContext(fn) as T; // sync composables only

const registry = new WeakMap<NuxtApp, BootstrapLoaders>(); // per app instance, safe across SSR requests

export const registerBootstrapLoaders = (nuxtApp: NuxtApp, loaders: BootstrapLoaders) => {
  registry.set(nuxtApp, { ...registry.get(nuxtApp), ...loaders });
};

export const useBootstrapState = <S extends BootstrapStage>(stage: S) => ({
  data: useState<StageData[S] | undefined>(`merkaly:${stage}:data`, () => undefined),
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
  const loader = registry.get(nuxtApp)?.[stage] as BootstrapLoader<StageData[typeof stage]> | undefined;
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

export const useBootstrapStage = <S extends BootstrapStage>(nuxtApp: NuxtApp, stage: S) => { // public shape of a stage
  const { data, error, status } = useBootstrapState(stage);

  const isReady = computed(() => status.value === 'success');

  const refresh = () => runBootstrapStage(nuxtApp, stage, { force: true }); // a failure only sets error

  return { data, error, isReady, refresh, status };
};
