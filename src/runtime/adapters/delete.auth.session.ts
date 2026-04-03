import type { AdapterOptions } from '../utils/withAdapter';
import { withAdapter } from '../utils/withAdapter';

interface DeleteAuthSessionArgs extends AdapterOptions {
  data: undefined;
  params: object;
}

export const deleteAuthSession = withAdapter<DeleteAuthSessionArgs>(() => ({
  global: true,
  method: 'DELETE',
  uri: '/session',
}));
