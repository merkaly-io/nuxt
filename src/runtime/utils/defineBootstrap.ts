import { useNuxtApp } from '#imports';
import type { BootstrapLoaders } from '../internal/bootstrap';
import { registerBootstrapLoaders } from '../internal/bootstrap';

export const defineBootstrap = <TOrganization = unknown, TMe = unknown>(loaders: BootstrapLoaders<TOrganization, TMe>) => { // call it from an app plugin
  registerBootstrapLoaders(useNuxtApp(), loaders as BootstrapLoaders);
};
