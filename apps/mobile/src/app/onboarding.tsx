import { useRouter } from 'expo-router';

import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { useAppStore } from '@/store/app.store';

export default function OnboardingRoute() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  return (
    <OnboardingScreen
      onDone={async () => {
        await completeOnboarding();
        router.replace('/accueil');
      }}
    />
  );
}
