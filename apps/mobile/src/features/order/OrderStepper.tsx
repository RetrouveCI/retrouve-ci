import React from 'react';
import { View } from 'react-native';

import { Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';

const STEPS = ['Pack', 'Livraison', 'Paiement', 'Confirmé'];

/** Top step indicator for the order flow (1-based step). */
export function OrderStepper({ step }: { step: number }) {
  const palette = usePalette();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 6 }}>
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const active = step === n;
        const bg = done ? palette.green : active ? palette.text : palette.surface3;
        const fg = done || active ? '#FFFFFF' : palette.text3;
        return (
          <React.Fragment key={label}>
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: bg,
                  borderWidth: 2,
                  borderColor: active ? palette.text : 'transparent',
                }}
              >
                {done ? (
                  <Icon name="check" size={15} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <Txt weight="bold" style={{ fontSize: 13, color: fg }}>
                    {n}
                  </Txt>
                )}
              </View>
              <Txt weight="semibold" style={{ fontSize: 10.5, color: active ? palette.text : palette.text3 }}>
                {label}
              </Txt>
            </View>
            {i < STEPS.length - 1 ? (
              <View
                style={{
                  flex: 1,
                  height: 2,
                  marginHorizontal: 4,
                  marginTop: 14,
                  borderRadius: 1,
                  backgroundColor: step > n ? palette.green : palette.border2,
                }}
              />
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
}
