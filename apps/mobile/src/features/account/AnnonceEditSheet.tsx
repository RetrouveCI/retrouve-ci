import * as ImagePicker from 'expo-image-picker';
import React, { forwardRef, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';

import { Btn, Field, Segmented, Sheet, Txt, type SheetRef } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { fontFamily } from '@/design/fonts';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { ANNONCE_CATEGORIES } from '@/services/account.service';
import { ABIDJAN_COMMUNES, CITIES, type AnnonceStatus, type MyAnnonce } from '@/services/types';

export type AnnonceDraft = MyAnnonce & { isNew?: boolean };

type PickerKind = 'category' | 'city' | 'commune';

interface AnnonceEditSheetProps {
  draft: AnnonceDraft | null;
  onSave: (draft: AnnonceDraft) => void;
}

function Selector({
  label,
  value,
  placeholder,
  icon,
  disabled,
  onPress,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  icon: IconName;
  disabled?: boolean;
  onPress: () => void;
}) {
  const palette = usePalette();
  return (
    <View>
      <Txt weight="semibold" style={{ fontSize: 13.5, color: disabled ? palette.text3 : palette.text2, marginBottom: 8 }}>
        {label}
      </Txt>
      <Pressable
        onPress={disabled ? undefined : onPress}
        style={{
          height: 54,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 11,
          borderRadius: radius.lg,
          backgroundColor: disabled ? palette.surface3 : palette.surface,
          borderWidth: 1.5,
          borderColor: value && !disabled ? palette.green : palette.border2,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Icon name={icon} size={19} color={value && !disabled ? palette.green : palette.text3} />
        <Txt weight={value ? 'semibold' : 'medium'} style={{ flex: 1, fontSize: 15.5, color: value ? palette.text : palette.text3 }}>
          {value ?? placeholder}
        </Txt>
        <Icon name="chevD" size={18} color={palette.text3} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

/** Create/edit one of the user's own listings. Control via ref present/dismiss. */
export const AnnonceEditSheet = forwardRef<SheetRef, AnnonceEditSheetProps>(function AnnonceEditSheet(
  { draft, onSave },
  ref,
) {
  const palette = usePalette();
  const [local, setLocal] = useState<AnnonceDraft | null>(draft);
  const [picker, setPicker] = useState<PickerKind | null>(null);

  useEffect(() => {
    setLocal(draft);
  }, [draft]);

  if (!local) return <Sheet ref={ref} snapPoints={['92%']}><View /></Sheet>;

  const set = <K extends keyof AnnonceDraft>(key: K, value: AnnonceDraft[K]) =>
    setLocal((l) => {
      if (!l) return l;
      const next = { ...l, [key]: value };
      if (key === 'city' && value !== 'Abidjan') next.commune = null;
      return next;
    });

  const setCategory = (category: string) => {
    const meta = ANNONCE_CATEGORIES.find((c) => c.category === category);
    setLocal((l) => (l ? { ...l, category, tone: meta?.tone ?? 'doc' } : l));
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!res.canceled) set('image', res.assets[0].uri);
  };

  const valid =
    (local.title ?? '').trim().length >= 3 && Boolean(local.city) && (local.city !== 'Abidjan' || Boolean(local.commune));

  const pickerData: Record<PickerKind, { title: string; options: readonly string[]; current: string | null }> = {
    category: { title: 'Catégorie', options: ANNONCE_CATEGORIES.map((c) => c.category), current: local.category },
    city: { title: 'Choisir une ville', options: CITIES, current: local.city },
    commune: { title: 'Choisir une commune', options: ABIDJAN_COMMUNES, current: local.commune },
  };

  return (
    <Sheet ref={ref} snapPoints={['92%']} onChange={(i) => i >= 0 && setPicker(null)}>
      {picker ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Pressable onPress={() => setPicker(null)} hitSlop={8}>
              <Icon name="chevL" size={24} color={palette.text} />
            </Pressable>
            <Txt weight="bold" style={{ fontSize: 19, color: palette.text }}>
              {pickerData[picker].title}
            </Txt>
          </View>
          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 4 }}>
              {pickerData[picker].options.map((option) => {
                const on = option === pickerData[picker].current;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (picker === 'category') setCategory(option);
                      else set(picker, option);
                      setPicker(null);
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 15,
                      paddingHorizontal: 14,
                      borderRadius: 14,
                      backgroundColor: on ? palette.greenSoft : 'transparent',
                    }}
                  >
                    <Txt weight={on ? 'semibold' : 'medium'} style={{ fontSize: 16, color: on ? palette.green : palette.text }}>
                      {option}
                    </Txt>
                    {on ? <Icon name="check" size={20} color={palette.green} strokeWidth={2.4} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 560 }}>
          <View style={{ gap: 18 }}>
            <Txt weight="bold" style={{ fontSize: 19, color: palette.text }}>
              {local.isNew ? 'Publier une annonce' : "Modifier l'annonce"}
            </Txt>

            {/* Photo */}
            <View>
              <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 8 }}>
                Photo de l&apos;objet
              </Txt>
              <Pressable
                onPress={pickImage}
                style={{
                  height: local.image ? 180 : 132,
                  borderRadius: 16,
                  overflow: 'hidden',
                  borderWidth: local.image ? 0 : 1.5,
                  borderColor: palette.border2,
                  borderStyle: 'dashed',
                  backgroundColor: palette.surface2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 9,
                }}
              >
                {local.image ? (
                  <Image source={{ uri: local.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                ) : (
                  <>
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 13,
                        backgroundColor: palette.greenSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="image" size={22} color={palette.green} />
                    </View>
                    <Txt weight="semibold" style={{ fontSize: 14, color: palette.text2 }}>
                      Ajouter une photo
                    </Txt>
                  </>
                )}
              </Pressable>
            </View>

            {/* Status */}
            <View>
              <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 8 }}>
                Statut
              </Txt>
              <Segmented<AnnonceStatus>
                value={local.status}
                onChange={(v) => set('status', v)}
                options={[
                  { value: 'lost', label: 'Perdu', icon: 'search' },
                  { value: 'found', label: 'Retrouvé', icon: 'checkCircle' },
                ]}
                accentMap={{ lost: palette.orange, found: palette.green }}
              />
            </View>

            <Field
              label="Titre de l'annonce"
              icon="tag"
              placeholder="Ex : Carte d'identité au nom de…"
              value={local.title}
              onChangeText={(v) => set('title', v)}
            />

            {/* Description */}
            <View>
              <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 8 }}>
                Description
              </Txt>
              <TextInput
                value={local.description ?? ''}
                onChangeText={(v) => set('description', v)}
                multiline
                placeholder="Décrivez l'objet : couleur, marque, signes distinctifs, lieu…"
                placeholderTextColor={palette.text3}
                style={{
                  minHeight: 110,
                  padding: 14,
                  borderRadius: radius.lg,
                  backgroundColor: palette.surface,
                  borderWidth: 1.5,
                  borderColor: palette.border2,
                  fontFamily: fontFamily.medium,
                  fontSize: 15.5,
                  color: palette.text,
                  textAlignVertical: 'top',
                }}
              />
            </View>

            <Selector label="Catégorie" icon="grid" placeholder="Choisir une catégorie" value={local.category} onPress={() => setPicker('category')} />
            <Selector label="Ville" icon="pin" placeholder="Choisir une ville" value={local.city} onPress={() => setPicker('city')} />
            <Selector
              label="Commune"
              icon="grid"
              placeholder={local.city === 'Abidjan' ? 'Choisir une commune' : 'Disponible pour Abidjan'}
              value={local.commune}
              disabled={local.city !== 'Abidjan'}
              onPress={() => setPicker('commune')}
            />

            <Btn
              variant="primary"
              size="lg"
              fullWidth
              icon="check"
              label={local.isNew ? "Publier l'annonce" : 'Enregistrer'}
              disabled={!valid}
              onPress={() => onSave(local)}
            />
          </View>
        </ScrollView>
      )}
    </Sheet>
  );
});
