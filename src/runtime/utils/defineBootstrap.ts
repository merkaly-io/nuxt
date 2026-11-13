import { useNuxtApp } from '#imports';
import type { BootstrapLoaders } from '../internal/state';
import { registerBootstrapLoaders } from '../internal/state';

export const defineBootstrap = (loaders: BootstrapLoaders) => registerBootstrapLoaders(useNuxtApp(), loaders); // call it from an app plugin
