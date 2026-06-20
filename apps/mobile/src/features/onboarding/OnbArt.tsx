import React from 'react';
import { View } from 'react-native';

import { ObjectThumb, StatusBadge, Txt } from '@/components';
import { fontFamily } from '@/design/fonts';
import { Icon } from '@/design/Icon';
import { QRCode } from '@/design/QRCode';
import { shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

export type OnbArtKind = 'lost' | 'sticker' | 'community';

/** Floating card used as a satellite in the illustrations. */
function FloatCard({
  size,
  radius,
  style,
  children,
}: {
  size: number;
  radius: number;
  style?: object;
  children: React.ReactNode;
}) {
  const palette = usePalette();
  return (
    <View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: palette.surface,
          borderWidth: 1,
          borderColor: palette.border2,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadows.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Decorative onboarding illustration (lost / sticker / community). */
export function OnbArt({ kind, accent }: { kind: OnbArtKind; accent?: boolean }) {
  const palette = usePalette();
  const c1 = accent ? palette.orange : palette.green;
  const c2 = accent ? palette.orangeLight : palette.greenLight;
  const halo = accent ? palette.orangeSoft : palette.greenSoft;

  return (
    <View style={{ width: 230, height: 230, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: 230, height: 230, borderRadius: 115, backgroundColor: halo }} />

      {kind === 'lost' ? (
        <>
          <View
            style={{ position: 'absolute', width: 175, height: 175, borderRadius: 88, borderWidth: 1.5, borderColor: palette.border2, borderStyle: 'dashed' }}
          />
          <View
            style={[
              {
                width: 120,
                height: 120,
                borderRadius: 30,
                backgroundColor: palette.surface,
                borderWidth: 1,
                borderColor: palette.border2,
                alignItems: 'center',
                justifyContent: 'center',
              },
              shadows.lg,
            ]}
          >
            <Icon name="pin" size={56} color={c1} strokeWidth={1.7} />
          </View>
          <FloatCard size={52} radius={18} style={{ top: 18, right: 24 }}>
            <Icon name="search" size={24} color={c2} />
          </FloatCard>
          <FloatCard size={46} radius={16} style={{ bottom: 22, left: 18 }}>
            <Icon name="checkCircle" size={22} color={c1} />
          </FloatCard>
        </>
      ) : null}

      {kind === 'sticker' ? (
        <>
          <View
            style={[
              {
                width: 138,
                height: 138,
                borderRadius: 26,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 14,
                transform: [{ rotate: '-6deg' }],
              },
              shadows.lg,
            ]}
          >
            <QRCode value="RC-STICKER" size={88} fg="#14171A" />
            <Txt style={{ fontFamily: fontFamily.medium, fontSize: 10, letterSpacing: 1.5, color: '#14171A' }}>
              RETROUVECI
            </Txt>
          </View>
          <FloatCard size={50} radius={17} style={{ top: 30, right: 16 }}>
            <Icon name="shield" size={24} color={c1} />
          </FloatCard>
        </>
      ) : null}

      {kind === 'community' ? (
        <>
          <View style={{ width: 178, gap: 10 }}>
            {([
              { status: 'found' as const, tone: 'doc' as const },
              { status: 'lost' as const, tone: 'phone' as const },
            ]).map((r, i) => (
              <View
                key={i}
                style={[
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 11,
                    backgroundColor: palette.surface2,
                    borderWidth: 1,
                    borderColor: palette.border2,
                    borderRadius: 18,
                    padding: 11,
                  },
                  shadows.md,
                ]}
              >
                <ObjectThumb tone={r.tone} radius={12} iconSize={20} style={{ width: 42, height: 42 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ height: 8, width: '78%', borderRadius: 4, backgroundColor: palette.border2, marginBottom: 6 }} />
                  <StatusBadge status={r.status} size="sm" />
                </View>
              </View>
            ))}
          </View>
          <FloatCard size={50} radius={17} style={{ bottom: 14, right: 12 }}>
            <Icon name="globe" size={24} color={c2} />
          </FloatCard>
        </>
      ) : null}
    </View>
  );
}
