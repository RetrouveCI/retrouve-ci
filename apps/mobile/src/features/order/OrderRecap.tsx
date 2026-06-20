import React from 'react';
import { View } from 'react-native';

import { Card, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';
import { formatPrice } from '@/lib/format';

import type { Pack } from './data';

/** A label/value row used in recaps. `value` may be a string or a node. */
export function Line({
  label,
  value,
  valueColor,
  style,
}: {
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  style?: object;
}) {
  const palette = usePalette();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <Txt weight="regular" style={{ fontSize: 13.5, color: palette.text2 }}>
        {label}
      </Txt>
      {typeof value === 'string' ? (
        <Txt weight="semibold" style={{ fontSize: 13.5, color: valueColor ?? palette.text }}>
          {value}
        </Txt>
      ) : (
        value
      )}
    </View>
  );
}

/** Compact order summary (pack + subtotal + delivery + total). */
export function OrderRecap({ pack, fee, total }: { pack: Pack; fee: number; total: number }) {
  const palette = usePalette();
  return (
    <Card padding={16} style={{ backgroundColor: palette.surface2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: palette.greenSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="qr" size={22} color={palette.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt weight="bold" style={{ fontSize: 15, color: palette.text }}>
            Pack {pack.name}
          </Txt>
          <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginTop: 1 }}>
            {pack.qty} stickers QR
          </Txt>
        </View>
      </View>
      <View style={{ height: 1, backgroundColor: palette.border, marginVertical: 14 }} />
      <Line label="Sous-total" value={formatPrice(pack.price)} />
      <Line
        label="Livraison"
        value={fee === 0 ? 'Offerte' : formatPrice(fee)}
        valueColor={fee === 0 ? palette.green : undefined}
        style={{ marginTop: 8 }}
      />
      <View style={{ height: 1, backgroundColor: palette.border, marginVertical: 14 }} />
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Txt weight="bold" style={{ fontSize: 16, color: palette.text }}>
          Total
        </Txt>
        <Txt weight="bold" style={{ fontSize: 18, color: palette.green }}>
          {formatPrice(total)}
        </Txt>
      </View>
    </Card>
  );
}
