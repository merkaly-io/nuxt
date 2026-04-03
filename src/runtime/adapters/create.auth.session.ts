import { useAuth } from '#imports';
import type { AdapterOptions } from '../utils/withAdapter';
import { withAdapter } from '../utils/withAdapter';

interface AuthSessionData {
  expiresAt: string | Date;
  issuedAt: string | Date;
  orgId?: string;
  role: string;
  userId: string;
}

interface CreateAuthSessionArgs extends AdapterOptions {
  data: AuthSessionData;
  params: object;
}

export const createAuthSession = withAdapter<CreateAuthSessionArgs>(() => {
  const { token } = useAuth();

  return {
    default: () => ({} as AuthSessionData),
    global: true,
    headers: {
      authorization: token.value ? `Bearer ${token.value}` : '',
    },
    method: 'POST',
    uri: '/session',
  };
});
