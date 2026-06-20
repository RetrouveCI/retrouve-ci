import React from 'react';
import { View } from 'react-native';

import { Btn, Card, IconBtn, ObjectThumb, StatusBadge, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { fontFamily } from '@/design/fonts';
import { QRCode } from '@/design/QRCode';
import { usePalette } from '@/design/useScheme';
import type { MyAnnonce, Order, Sticker } from '@/services/types';

/* ── Mes annonces ── */
export function MyAnnonceCard({
  annonce,
  onResolve,
  onEdit,
  onDelete,
}: {
  annonce: MyAnnonce;
  onResolve: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const palette = usePalette();
  const resolved = annonce.state === 'resolved';

  return (
    <Card padding={13} style={{ opacity: resolved ? 0.72 : 1 }}>
      <View style={{ flexDirection: 'row', gap: 13 }}>
        <ObjectThumb
          tone={annonce.tone}
          uri={annonce.image}
          radius={13}
          iconSize={22}
          style={{ width: 64, height: 64 }}
        />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <StatusBadge status={annonce.status} size="sm" />
            {resolved ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                  borderRadius: 999,
                  backgroundColor: palette.greenSoft,
                }}
              >
                <Icon name="check" size={12} color={palette.green} strokeWidth={2.6} />
                <Txt weight="semibold" style={{ fontSize: 11.5, color: palette.green }}>
                  Résolu
                </Txt>
              </View>
            ) : null}
          </View>
          <Txt weight="semibold" style={{ fontSize: 15, color: palette.text, marginTop: 7 }}>
            {annonce.title}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 7 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="eye" size={13} color={palette.text3} />
              <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3 }}>
                {annonce.views} vues
              </Txt>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="clock" size={13} color={palette.text3} />
              <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3 }}>
                {annonce.timeLabel}
              </Txt>
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          gap: 8,
          marginTop: 13,
          paddingTop: 13,
          borderTopWidth: 1,
          borderTopColor: palette.border,
        }}
      >
        {!resolved ? (
          <View style={{ flex: 1 }}>
            <Btn variant="soft" size="sm" icon="checkCircle" label="Résolu" fullWidth onPress={onResolve} />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Btn variant="ghost" size="sm" icon="edit" label="Modifier" fullWidth onPress={onEdit} />
          </View>
        )}
        {!resolved ? <Btn variant="ghost" size="sm" icon="edit" onPress={onEdit} /> : null}
        <Btn variant="ghost" size="sm" icon="trash" onPress={onDelete} />
      </View>
    </Card>
  );
}

/* ── Stickers ── */
export function StickerCard({
  sticker,
  onActivate,
  onShare,
}: {
  sticker: Sticker;
  onActivate: () => void;
  onShare: () => void;
}) {
  const palette = usePalette();
  return (
    <Card padding={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 14,
            backgroundColor: sticker.active ? '#FFFFFF' : palette.surface3,
            borderWidth: 1,
            borderColor: palette.border,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: sticker.active ? 1 : 0.55,
          }}
        >
          <QRCode value={sticker.code} size={64} fg="#14171A" />
        </View>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontFamily: fontFamily.medium, fontSize: 12.5, color: palette.text2, letterSpacing: 0.5 }}>
            {sticker.code}
          </Txt>
          <Txt weight="semibold" style={{ fontSize: 15, color: palette.text, marginTop: 4 }}>
            {sticker.object ?? 'Sticker non activé'}
          </Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: sticker.active ? palette.greenSoft : palette.surface3,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: sticker.active ? palette.green : palette.text3,
                }}
              />
              <Txt
                weight="semibold"
                style={{ fontSize: 11.5, color: sticker.active ? palette.green : palette.text3 }}
              >
                {sticker.active ? 'Actif' : 'Inactif'}
              </Txt>
            </View>
            {sticker.active ? (
              <Txt weight="regular" style={{ fontSize: 12, color: palette.text3 }}>
                {sticker.scans} scan{sticker.scans > 1 ? 's' : ''}
              </Txt>
            ) : null}
          </View>
        </View>
        {sticker.active ? (
          <IconBtn name="share" variant="ghost" onPress={onShare} />
        ) : (
          <Btn variant="accent" size="sm" label="Activer" onPress={onActivate} />
        )}
      </View>
    </Card>
  );
}

/* ── Commandes ── */
export function CommandeCard({ order }: { order: Order }) {
  const palette = usePalette();
  const shipping = order.tone === 'shipping';
  return (
    <Card padding={14}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Txt style={{ fontFamily: fontFamily.medium, fontSize: 12.5, color: palette.text2 }}>{order.ref}</Txt>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: shipping ? palette.orangeSoft : palette.greenSoft,
          }}
        >
          <Icon
            name={shipping ? 'package' : 'checkCircle'}
            size={13}
            color={shipping ? palette.orangeDark : palette.green}
          />
          <Txt weight="semibold" style={{ fontSize: 12, color: shipping ? palette.orangeDark : palette.green }}>
            {order.status}
          </Txt>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 12 }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 14,
            backgroundColor: palette.greenSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="qr" size={24} color={palette.green} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt weight="semibold" style={{ fontSize: 15, color: palette.text }}>
            {order.title}
          </Txt>
          <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginTop: 2 }}>
            {order.qty} stickers · {order.date}
          </Txt>
        </View>
        <Txt weight="bold" style={{ fontSize: 15.5, color: palette.green }}>
          {order.price}
        </Txt>
      </View>
    </Card>
  );
}
