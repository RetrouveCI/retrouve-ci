import { Redirect } from 'expo-router';

// Entry point — onboarding gating will be added in Phase 2.
export default function Index() {
  return <Redirect href="/accueil" />;
}
