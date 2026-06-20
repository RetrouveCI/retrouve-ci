import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

export type SheetRef = BottomSheetModal;

interface SheetProps {
  snapPoints?: (string | number)[];
  children: React.ReactNode;
  /** Render children inside the scrollable BottomSheetView container. */
  padding?: number;
}

/**
 * Thin wrapper around @gorhom/bottom-sheet's modal — applies the brand surface,
 * a dimmed backdrop and safe-area aware bottom padding. Control it via ref:
 * `ref.current?.present()` / `.dismiss()`.
 */
export const Sheet = forwardRef<SheetRef, SheetProps>(function Sheet(
  { snapPoints, children, padding = 20 },
  ref,
) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.45} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enableDynamicSizing={!snapPoints}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: palette.text3 }}
      backgroundStyle={{
        backgroundColor: palette.surface,
        borderTopLeftRadius: radius.xl,
        borderTopRightRadius: radius.xl,
      }}
    >
      <BottomSheetView style={{ paddingHorizontal: padding, paddingBottom: insets.bottom + 20 }}>
        {children}
      </BottomSheetView>
    </BottomSheetModal>
  );
});
