import React from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Btn, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Centered confirmation dialog (used for destructive actions like delete). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  danger,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const palette = usePalette();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(8,12,9,0.5)',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 28,
        }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            {
              width: '100%',
              maxWidth: 340,
              backgroundColor: palette.surface,
              borderRadius: 24,
              padding: 24,
              alignItems: 'center',
            },
            shadows.lg,
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: danger ? palette.orangeSoft : palette.greenSoft,
              marginBottom: 16,
            }}
          >
            <Icon name={danger ? 'trash' : 'info'} size={26} color={danger ? palette.orangeDark : palette.green} />
          </View>
          <Txt weight="bold" style={{ fontSize: 19, color: palette.text, textAlign: 'center' }}>
            {title}
          </Txt>
          <Txt
            weight="regular"
            style={{ fontSize: 14.5, lineHeight: 21, color: palette.text2, textAlign: 'center', marginTop: 8, marginBottom: 22 }}
          >
            {message}
          </Txt>
          <View style={{ width: '100%', gap: 10 }}>
            <Btn variant={danger ? 'accent' : 'primary'} size="md" fullWidth label={confirmLabel} onPress={onConfirm} />
            <Btn variant="ghost" size="md" fullWidth label="Annuler" onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
