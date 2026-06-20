import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, EmptyState, MeshBg, Segmented, Skeleton, Txt, type SheetRef } from '@/components';
import { Icon } from '@/design/Icon';
import { fontFamily } from '@/design/fonts';
import { usePalette } from '@/design/useScheme';
import { useAnnonces } from '@/services/annonces.service';

import { AnnonceRow } from './AnnonceRow';
import { FilterChip } from './FilterChip';
import { FiltersSheet } from './FiltersSheet';
import {
  activeFilterCount,
  DEFAULT_FILTERS,
  filterAnnonces,
  PERIODS,
  type ListingsFilters,
  type StatusFilter,
} from './filters';

function RowSkeleton() {
  const palette = usePalette();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 13,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: palette.border,
        backgroundColor: palette.surface,
      }}
    >
      <Skeleton w={78} h={78} r={14} />
      <View style={{ flex: 1, paddingTop: 4 }}>
        <Skeleton w={70} h={20} r={10} />
        <Skeleton w="85%" h={15} r={7} style={{ marginTop: 12 }} />
        <Skeleton w="55%" h={13} r={7} style={{ marginTop: 18 }} />
      </View>
    </View>
  );
}

export function ListingsScreen() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ focus?: string; q?: string }>();
  const searchRef = useRef<TextInput>(null);
  const filtersRef = useRef<SheetRef>(null);

  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState(params.q ?? '');
  const [filters, setFilters] = useState<ListingsFilters>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);

  const { data: annonces = [] } = useAnnonces();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (params.focus) {
      const t = setTimeout(() => searchRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
  }, [params.focus]);

  const count = activeFilterCount(filters);
  const results = useMemo(
    () => filterAnnonces(annonces, status, filters, search),
    [annonces, status, filters, search],
  );

  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS);
    setStatus('all');
    setSearch('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <MeshBg />
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}>
        <Txt weight="bold" style={{ fontSize: 26, color: palette.text, marginBottom: 14 }}>
          Annonces
        </Txt>

        {/* Search + filter button */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              height: 50,
              paddingHorizontal: 14,
              borderRadius: 15,
              backgroundColor: palette.surface,
              borderWidth: 1,
              borderColor: palette.border2,
            }}
          >
            <Icon name="search" size={19} color={palette.text3} />
            <TextInput
              ref={searchRef}
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher…"
              placeholderTextColor={palette.text3}
              style={{
                flex: 1,
                fontFamily: fontFamily.medium,
                fontSize: 15.5,
                color: palette.text,
                padding: 0,
              }}
            />
            {search ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <Icon name="close" size={17} color={palette.text3} strokeWidth={2.2} />
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={() => filtersRef.current?.present()}
            style={{
              width: 50,
              height: 50,
              borderRadius: 15,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: count ? palette.green : palette.surface,
              borderWidth: 1,
              borderColor: count ? palette.green : palette.border2,
            }}
          >
            <Icon name="sliders" size={21} color={count ? '#FFFFFF' : palette.text} strokeWidth={2.1} />
            {count > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  minWidth: 20,
                  height: 20,
                  paddingHorizontal: 5,
                  borderRadius: 10,
                  backgroundColor: palette.orange,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: palette.bg,
                }}
              >
                <Txt weight="bold" style={{ fontSize: 11.5, color: '#FFFFFF' }}>
                  {count}
                </Txt>
              </View>
            ) : null}
          </Pressable>
        </View>

        {/* Status segmented */}
        <View style={{ marginTop: 14 }}>
          <Segmented<StatusFilter>
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'lost', label: 'Objets perdus', icon: 'search' },
              { value: 'found', label: 'Objets retrouvés', icon: 'checkCircle' },
            ]}
            accentMap={{ lost: palette.orange, found: palette.green }}
          />
        </View>

        {/* Active filter chips */}
        {count > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingTop: 12 }}
          >
            <Pressable
              onPress={() => setFilters(DEFAULT_FILTERS)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                height: 32,
                paddingHorizontal: 11,
                borderRadius: 999,
                backgroundColor: palette.orangeSoft,
              }}
            >
              <Icon name="refresh" size={14} color={palette.orangeDark} strokeWidth={2.2} />
              <Txt weight="semibold" style={{ fontSize: 13, color: palette.orangeDark }}>
                Réinitialiser
              </Txt>
            </Pressable>
            {filters.city ? (
              <FilterChip
                label={filters.city}
                onRemove={() => setFilters((f) => ({ ...f, city: null, commune: null }))}
              />
            ) : null}
            {filters.commune ? (
              <FilterChip
                label={filters.commune}
                onRemove={() => setFilters((f) => ({ ...f, commune: null }))}
              />
            ) : null}
            {filters.period !== PERIODS[0] ? (
              <FilterChip
                label={filters.period}
                onRemove={() => setFilters((f) => ({ ...f, period: PERIODS[0] }))}
              />
            ) : null}
          </ScrollView>
        ) : null}
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {loading ? (
          <View style={{ gap: 12 }}>
            {[0, 1, 2, 3].map((i) => (
              <RowSkeleton key={i} />
            ))}
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <Txt weight="medium" style={{ fontSize: 13.5, color: palette.text2 }}>
                {results.length} résultat{results.length > 1 ? 's' : ''}
              </Txt>
              <Pressable
                onPress={reload}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
              >
                <Icon name="refresh" size={15} color={palette.text3} strokeWidth={2.2} />
                <Txt weight="medium" style={{ fontSize: 13, color: palette.text3 }}>
                  Actualiser
                </Txt>
              </Pressable>
            </View>

            {results.length === 0 ? (
              <EmptyState
                icon="search"
                title="Aucun résultat"
                text="Aucune annonce ne correspond à vos critères. Essayez d'élargir la zone ou la période."
                action={
                  <Btn
                    variant="soft"
                    size="md"
                    icon="refresh"
                    label="Réinitialiser les filtres"
                    onPress={resetAll}
                  />
                }
              />
            ) : (
              <View style={{ gap: 12 }}>
                {results.map((a) => (
                  <AnnonceRow key={a.id} annonce={a} />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FiltersSheet ref={filtersRef} filters={filters} onApply={setFilters} />
    </View>
  );
}
