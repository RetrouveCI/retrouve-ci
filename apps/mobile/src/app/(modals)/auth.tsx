import { useLocalSearchParams, useRouter } from 'expo-router';

import { AuthScreen, type AuthView } from '@/features/auth/AuthScreen';
import { useAppStore } from '@/store/app.store';

/** Auth modal — phone OTP login / register / forgot password. */
export default function AuthModal() {
  const router = useRouter();
  const { view } = useLocalSearchParams<{ view?: AuthView }>();
  const showToast = useAppStore((s) => s.showToast);

  return (
    <AuthScreen
      initialView={view ?? 'login'}
      onClose={() => router.back()}
      onAuthed={() => {
        router.replace('/compte');
        showToast('Bienvenue sur RetrouveCI', 'checkCircle');
      }}
    />
  );
}
