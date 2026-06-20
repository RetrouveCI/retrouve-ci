import React, { forwardRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Btn, Sheet, Txt, type SheetRef } from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { ABIDJAN_COMMUNES, CITIES } from '@/services/types';

import {
  activeFilterCount,
  DEFAULT_FILTERS,
  PERIODS,
  type ListingsFilters,
  type Period,
} from './filters';

interface FiltersSheetProps {
  filters: ListingsFilters;
  onApply: (filters: ListingsFilters) => void;
}

type PickerKind = 'city' | 'commune' | 'period';

/** Labeled selector button that opens an inline option list. */
function Selector({
  label,
  value,
  placeholder,
  icon,
  disabled,
  onPress,
  onClear,
}: {
  label: string;
  value: string | null;
  placeholder: string;
  icon: IconName;
  disabled?: boolean;
  onPress: () => void;
  onClear?: () => void;
}) {
  const palette = usePalette();
  const filled = Boolean(value) && !disabled;
  return (
    <View>
      <Txt
        weight="semibold"
        style={{ fontSize: 13.5, color: disabled ? palette.text3 : palette.text2, marginBottom: 8 }}
      >
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
          borderColor: filled ? palette.green : palette.border2,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <Icon name={icon} size={19} color={filled ? palette.green : palette.text3} />
        <Txt
          weight={value ? 'semibold' : 'medium'}
          style={{ flex: 1, fontSize: 15.5, color: value ? palette.text : palette.text3 }}
        >
          {value ?? placeholder}
        </Txt>
        {filled && onClear ? (
          <Pressable onPress={onClear} hitSlop={8} style={{ padding: 2 }}>
            <Icon name="close" size={17} color={palette.text3} strokeWidth={2.2} />
          </Pressable>
        ) : (
          <Icon name="chevD" size={18} color={palette.text3} strokeWidth={2.2} />
        )}
      </Pressable>
    </View>
  );
}

/** Bottom sheet with advanced filters (ville / commune / période). */
export const FiltersSheet = forwardRef<SheetRef, FiltersSheetProps>(function FiltersSheet(
  { filters, onApply },
  ref,
) {
  const palette = usePalette();
  const [local, setLocal] = useState<ListingsFilters>(filters);
  const [picker, setPicker] = useState<PickerKind | null>(null);

  const set = <K extends keyof ListingsFilters>(key: K, value: ListingsFilters[K]) =>
    setLocal((l) => {
      const next = { ...l, [key]: value };
      if (key === 'city' && value !== 'Abidjan') next.commune = null;
      return next;
    });

  const count = activeFilterCount(local);

  const pickerConfig: Record<PickerKind, { title: string; options: readonly string[]; current: string | null }> = {
    city: { title: 'Choisir une ville', options: CITIES, current: local.city },
    commune: { title: 'Choisir une commune', options: ABIDJAN_COMMUNES, current: local.commune },
    period: { title: 'Période', options: PERIODS, current: local.period },
  };

  const apply = () => {
    onApply(local);
    (ref as React.RefObject<SheetRef>)?.current?.dismiss();
  };

  return (
    <Sheet
      ref={ref}
      snapPoints={['90%']}
      onChange={(index) => {
        if (index >= 0) {
          setLocal(filters);
          setPicker(null);
        }
      }}
    >
      {picker ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Pressable onPress={() => setPicker(null)} hitSlop={8}>
              <Icon name="chevL" size={24} color={palette.text} />
            </Pressable>
            <Txt weight="bold" style={{ fontSize: 19, color: palette.text }}>
              {pickerConfig[picker].title}
            </Txt>
          </View>
          <ScrollView style={{ maxHeight: 460 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 4 }}>
              {pickerConfig[picker].options.map((option) => {
                const on = option === pickerConfig[picker].current;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      if (picker === 'period') set('period', option as Period);
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
                    <Txt
                      weight={on ? 'semibold' : 'medium'}
                      style={{ fontSize: 16, color: on ? palette.green : palette.text }}
                    >
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
        <View style={{ gap: 18 }}>
          <Txt weight="bold" style={{ fontSize: 19, color: palette.text }}>
            Filtres avancés
          </Txt>
          <Selector
            label="Ville"
            icon="pin"
            placeholder="Toutes les villes"
            value={local.city}
            onPress={() => setPicker('city')}
            onClear={() => set('city', null)}
          />
          <Selector
            label="Commune"
            icon="grid"
            placeholder={local.city === 'Abidjan' ? 'Toutes les communes' : 'Disponible pour Abidjan'}
            value={local.commune}
            disabled={local.city !== 'Abidjan'}
            onPress={() => setPicker('commune')}
            onClear={() => set('commune', null)}
          />
          <Selector
            label="Période"
            icon="calendar"
            placeholder="Toutes les dates"
            value={local.period !== PERIODS[0] ? local.period : null}
            onPress={() => setPicker('period')}
            onClear={() => set('period', PERIODS[0])}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
            <Btn
              variant="ghost"
              size="md"
              icon="refresh"
              label="Réinitialiser"
              onPress={() => setLocal(DEFAULT_FILTERS)}
            />
            <View style={{ flex: 1 }}>
              <Btn
                variant="primary"
                size="md"
                fullWidth
                label={count > 0 ? `Appliquer (${count})` : 'Appliquer'}
                onPress={apply}
              />
            </View>
          </View>
        </View>
      )}
    </Sheet>
  );
});
