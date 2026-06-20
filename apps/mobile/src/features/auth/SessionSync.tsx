import { useEffect } from 'react';

import { authClient } from '@/services/auth-client';
import { useAppStore } from '@/store/app.store';

/**
 * Mirrors a real better-auth session into the app store. Renders nothing.
 * Only pushes the authenticated user when a session exists — it never forces
 * the logged-out state, so the dev/demo default keeps working until a real
 * phone sign-in completes.
 */
export function SessionSync() {
  const { data } = authClient.useSession();
  const userId = data?.user?.id;

  useEffect(() => {
    if (!data?.user) return;
    useAppStore.setState({
      isAuthenticated: true,
      user: {
        id: data.user.id,
        fullName: data.user.name,
        phone: data.user.phoneNumber ?? '',
        avatarUrl: data.user.image ?? null,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return null;
}
