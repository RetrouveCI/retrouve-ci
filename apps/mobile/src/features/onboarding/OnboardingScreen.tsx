import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, MeshBg, Txt } from '@/components';
import { fontFamily } from '@/design/fonts';
import { Icon } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';

import { OnbArt, type OnbArtKind } from './OnbArt';

interface Slide {
  accent: boolean;
  art: OnbArtKind;
  eyebrow: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    accent: false,
    art: 'lost',
    eyebrow: 'PERDU · RETROUVÉ',
    title: 'Retrouvez ce qui compte',
    text: 'Un objet perdu ? Un objet trouvé ? RetrouveCI reconnecte les Ivoiriens à leurs biens grâce à un simple QR code.',
  },
  {
    accent: true,
    art: 'sticker',
    eyebrow: 'STICKERS QR',
    title: 'Collez, protégez',
    text: 'Apposez nos stickers QR sur vos objets de valeur. Quiconque les retrouve vous joint en un scan, sans révéler votre numéro.',
  },
  {
    accent: false,
    art: 'community',
    eyebrow: 'COMMUNAUTÉ',
    title: "Toute la Côte d'Ivoire",
    text: "Parcourez les annonces d'objets perdus et retrouvés près de chez vous, d'Abidjan à Korhogo.",
  },
];

export function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last = i === SLIDES.length - 1;
  const accentColor = slide.accent ? palette.orange : palette.green;

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <MeshBg accent={slide.accent} />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 22,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pin" size={17} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Txt weight="bold" style={{ fontSize: 16, color: palette.text }}>
            RetrouveCI
          </Txt>
        </View>
        {!last ? (
          <Txt weight="semibold" onPress={onDone} style={{ fontSize: 15, color: palette.text2, padding: 8 }}>
            Passer
          </Txt>
        ) : null}
      </View>

      {/* Art + copy */}
      <Animated.View
        key={i}
        entering={FadeIn.duration(400)}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <OnbArt kind={slide.art} accent={slide.accent} />
        <View style={{ marginTop: 44, alignItems: 'center' }}>
          <Txt
            style={{
              fontFamily: fontFamily.medium,
              fontSize: 12,
              letterSpacing: 2.5,
              color: slide.accent ? palette.orangeDark : palette.green,
              marginBottom: 14,
            }}
          >
            {slide.eyebrow}
          </Txt>
          <Txt weight="bold" style={{ fontSize: 31, lineHeight: 34, color: palette.text, textAlign: 'center' }}>
            {slide.title}
          </Txt>
          <Txt
            weight="regular"
            style={{ fontSize: 16, lineHeight: 25, color: palette.text2, textAlign: 'center', marginTop: 14, maxWidth: 320 }}
          >
            {slide.text}
          </Txt>
        </View>
      </Animated.View>

      {/* Dots + CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 26 }}>
          {SLIDES.map((_, k) => (
            <Pressable
              key={k}
              onPress={() => setI(k)}
              style={{
                height: 7,
                borderRadius: 4,
                width: k === i ? 26 : 7,
                backgroundColor: k === i ? accentColor : palette.border2,
              }}
            />
          ))}
        </View>
        {last ? (
          <Btn variant="primary" fullWidth iconRight="arrowR" label="Commencer" onPress={onDone} />
        ) : (
          <Btn
            variant={slide.accent ? 'accent' : 'primary'}
            fullWidth
            iconRight="chevR"
            label="Suivant"
            onPress={() => setI(i + 1)}
          />
        )}
      </View>
    </View>
  );
}
