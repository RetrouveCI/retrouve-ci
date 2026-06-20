import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { radius } from '@/design/tokens';

/**
 * Fullscreen QR scan modal — Phase 1 stub. The live expo-camera scanning flow
 * (ScanFlow: scanning -> result) lands in Phase 4. The route + presentation are
 * wired now so the TabBar Scanner button works end-to-end.
 */
export default function ScanModal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#0B0E0C' }}>
      <Pressable
        onPress={() => router.back()}
        accessibilityLabel="Fermer"
        style={{
          position: 'absolute',
          top: insets.top + 12,
          left: 16,
          zIndex: 10,
          width: 44,
          height: 44,
          borderRadius: radius.md,
          backgroundColor: 'rgba(255,255,255,0.14)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="close" size={24} color="#FFFFFF" />
      </Pressable>

      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            width: 220,
            height: 220,
            borderRadius: radius.xl,
            borderWidth: 2,
            borderColor: '#F57C00',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="qr" size={64} color="#FFFFFF" />
        </View>
        <Txt weight="semibold" style={{ color: '#FFFFFF', fontSize: 16, textAlign: 'center' }}>
          Placez le QR code dans le cadre
        </Txt>
        <Txt
          weight="medium"
          style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center' }}
        >
          Le scanner caméra sera activé à la prochaine étape.
        </Txt>
      </View>
    </View>
  );
}
