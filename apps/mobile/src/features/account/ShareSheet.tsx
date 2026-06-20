import React, { forwardRef } from 'react';
import { Pressable, View } from 'react-native';

import { Sheet, Txt, type SheetRef } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { fontFamily } from '@/design/fonts';
import { QRCode } from '@/design/QRCode';
import { usePalette } from '@/design/useScheme';
import type { Sticker } from '@/services/types';

interface Channel {
  id: string;
  label: string;
  icon: IconName;
  color: string;
  dark?: boolean;
}

const CHANNELS: Channel[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp', color: '#25D366' },
  { id: 'telegram', label: 'Telegram', icon: 'telegram', color: '#229ED9' },
  { id: 'facebook', label: 'Facebook', icon: 'facebook', color: '#1877F2' },
  { id: 'instagram', label: 'Instagram', icon: 'instagram', color: '#E1306C' },
  { id: 'snapchat', label: 'Snapchat', icon: 'snapchat', color: '#FFFC00', dark: true },
];

/** Sticker-share bottom sheet — QR preview + social channel grid. */
export const ShareSheet = forwardRef<
  SheetRef,
  { sticker: Sticker | null; onShare: (label: string) => void }
>(function ShareSheet({ sticker, onShare }, ref) {
  const palette = usePalette();
  const message = sticker
    ? `🔎 Aide-moi à retrouver mes objets avec RetrouveCI. Si tu trouves cet objet, scanne le QR ${sticker.code} pour me contacter.`
    : '';

  return (
    <Sheet ref={ref} snapPoints={['56%']}>
      <Txt weight="bold" style={{ fontSize: 19, color: palette.text, marginBottom: 16 }}>
        Partager le sticker
      </Txt>

      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          padding: 14,
          borderRadius: 16,
          backgroundColor: palette.surface2,
        }}
      >
        <View
          style={{
            width: 54,
            height: 54,
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: palette.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {sticker ? <QRCode value={sticker.code} size={44} fg="#14171A" /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: fontFamily.medium, fontSize: 12, color: palette.text2 }}>
            {sticker?.code}
          </Txt>
          <Txt weight="regular" numberOfLines={2} style={{ fontSize: 12.5, color: palette.text3, lineHeight: 18, marginTop: 4 }}>
            {message}
          </Txt>
        </View>
      </View>

      <Txt
        weight="bold"
        style={{ fontSize: 12.5, letterSpacing: 0.5, color: palette.text3, marginTop: 18, marginBottom: 10 }}
      >
        ENVOYER EN MESSAGE VIA
      </Txt>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {CHANNELS.map((ch) => (
          <Pressable
            key={ch.id}
            onPress={() => onShare(ch.label)}
            style={{ alignItems: 'center', gap: 8, width: 60 }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: ch.color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name={ch.icon} size={26} color={ch.dark ? '#1A1400' : '#FFFFFF'} strokeWidth={1.9} />
            </View>
            <Txt weight="semibold" style={{ fontSize: 11.5, color: palette.text2 }}>
              {ch.label}
            </Txt>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
});
