import type { AdapterOptions } from '../utils/withAdapter';
import { withAdapter } from '../utils/withAdapter';

interface AuthSessionData {
  expiresAt: string | Date;
  issuedAt: string | Date;
  orgId?: string;
  role: string;
  userId: string;
}


interface ReadAuthSessionArgs extends AdapterOptions {
  data: AuthSessionData;
  params: object;
}

export const readAuthSession = withAdapter<ReadAuthSessionArgs>(() => ({
  default: () => ({} as AuthSessionData),
  global: true,
  immediate: false,
  method: 'GET',
  uri: '/session',
}));
