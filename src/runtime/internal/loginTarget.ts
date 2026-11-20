import { useSessionStorage } from '@vueuse/core';

export const useLoginTarget = () => useSessionStorage<string | null>('merkaly:auth:target', null); // where the last login lands, survives the Auth0 round trip
