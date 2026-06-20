import { Redirect } from 'expo-router';

import { useAppStore } from '@/store/app.store';

/** Entry gate — show onboarding on first launch, otherwise the home tab. */
export default function Index() {
  const isHydrated = useAppStore((s) => s.isHydrated);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  // Wait for the store to hydrate (onboarding flag from secure storage).
  if (!isHydrated) return null;

  return <Redirect href={hasOnboarded ? '/accueil' : '/onboarding'} />;
}
