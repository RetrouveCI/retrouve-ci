import { useLocalSearchParams } from 'expo-router';

import { ScanFlow } from '@/features/scan/ScanFlow';

/**
 * Fullscreen QR scan modal. `activate=1` (from the Account "Activer" entry)
 * starts the flow in the unregistered/activation branch.
 */
export default function ScanModal() {
  const { activate } = useLocalSearchParams<{ activate?: string }>();
  return <ScanFlow activate={activate === '1'} />;
}
