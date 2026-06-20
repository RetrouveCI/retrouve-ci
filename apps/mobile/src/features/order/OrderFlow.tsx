import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Card, Field, IconBtn, MeshBg, Sheet, Txt, type SheetRef } from '@/components';
import { Icon } from '@/design/Icon';
import { fontFamily } from '@/design/fonts';
import { radius } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { formatNumber, formatPrice } from '@/lib/format';
import { CITIES, CURRENT_USER } from '@/services/types';
import { useAppStore } from '@/store/app.store';

import { DELIVERY_FEE, PACKS, PAYMENT_METHODS, PROMO_CODE } from './data';
import { Line, OrderRecap } from './OrderRecap';
import { OrderStepper } from './OrderStepper';

const CHECKOUT_BASE = process.env.EXPO_PUBLIC_PAYMENT_URL;

export function OrderFlow() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const showToast = useAppStore((s) => s.showToast);
  const setAccountSection = useAppStore((s) => s.setAccountSection);
  const cityRef = useRef<SheetRef>(null);

  const [step, setStep] = useState(1);
  const [packId, setPackId] = useState('famille');
  const [delivery, setDelivery] = useState({
    name: CURRENT_USER.name,
    phone: CURRENT_USER.phone,
    address: '',
    city: 'Abidjan',
    promo: '',
    promoOk: false,
  });
  const [payment, setPayment] = useState({ method: 'orange', number: '' });
  const [reference, setReference] = useState('');
  const [paying, setPaying] = useState(false);

  const pack = PACKS.find((p) => p.id === packId)!;
  const fee = delivery.promoOk ? 0 : DELIVERY_FEE;
  const total = pack.price + fee;
  const paymentMethod = PAYMENT_METHODS.find((p) => p.id === payment.method);

  const setD = <K extends keyof typeof delivery>(key: K, value: (typeof delivery)[K]) =>
    setDelivery((s) => ({ ...s, [key]: value }));

  const applyPromo = () => {
    if (delivery.promo.trim().toUpperCase() === PROMO_CODE) {
      setD('promoOk', true);
      showToast('Code promo appliqué — livraison offerte');
    } else {
      showToast('Code promo invalide');
    }
  };

  const deliveryValid = delivery.name.trim() && delivery.phone.trim() && delivery.address.trim();
  const paymentValid = payment.method && payment.number.replace(/\D/g, '').length >= 8;

  const goPay = async () => {
    setPaying(true);
    try {
      if (CHECKOUT_BASE) {
        // Real mobile-money checkout (CinetPay / PayDunya) in an in-app browser.
        await WebBrowser.openBrowserAsync(`${CHECKOUT_BASE}?amount=${total}&method=${payment.method}`);
      } else {
        // Demo: simulate the provider round-trip.
        await new Promise((r) => setTimeout(r, 1400));
      }
      setReference('CMD-2026-' + Math.floor(100000 + Math.random() * 900000));
      setStep(4);
    } finally {
      setPaying(false);
    }
  };

  const back = () => {
    if (step > 1 && step < 4) setStep(step - 1);
    else router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <MeshBg />

      {/* Header */}
      <View style={{ paddingTop: insets.top + 4, paddingHorizontal: 18, paddingBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          {step < 4 ? <IconBtn name="chevL" variant="ghost" onPress={back} /> : <View style={{ width: 44 }} />}
          <Txt weight="bold" style={{ flex: 1, fontSize: 17, color: palette.text }}>
            Commander des stickers
          </Txt>
          {step < 4 ? <IconBtn name="close" variant="ghost" onPress={() => router.back()} /> : null}
        </View>
        <OrderStepper step={step} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: step < 4 ? 130 : insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <View>
            <Txt weight="bold" style={{ fontSize: 22, color: palette.text }}>
              Choisissez votre pack
            </Txt>
            <Txt weight="regular" style={{ fontSize: 14, color: palette.text2, marginTop: 4, marginBottom: 18 }}>
              Sélectionnez le pack qui correspond à vos besoins.
            </Txt>
            <View style={{ gap: 12 }}>
              {PACKS.map((p) => {
                const on = p.id === packId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPackId(p.id)}
                    style={{
                      backgroundColor: palette.surface,
                      borderRadius: 18,
                      padding: 16,
                      borderWidth: on ? 2 : 1.5,
                      borderColor: on ? palette.green : palette.border2,
                    }}
                  >
                    {p.popular ? (
                      <View
                        style={{
                          position: 'absolute',
                          top: -10,
                          right: 16,
                          backgroundColor: palette.orange,
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: 999,
                        }}
                      >
                        <Txt weight="bold" style={{ fontSize: 11, color: '#FFFFFF' }}>
                          Populaire
                        </Txt>
                      </View>
                    ) : null}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 13 }}>
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 13,
                          backgroundColor: on ? palette.green : palette.greenSoft,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Icon name="package" size={22} color={on ? '#FFFFFF' : palette.green} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Txt weight="bold" style={{ fontSize: 17, color: palette.text }}>
                          {p.name}
                        </Txt>
                        <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginTop: 1, lineHeight: 17 }}>
                          {p.tagline}
                        </Txt>
                      </View>
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: on ? palette.green : 'transparent',
                          borderWidth: on ? 0 : 2,
                          borderColor: palette.border2,
                        }}
                      >
                        {on ? <Icon name="check" size={15} color="#FFFFFF" strokeWidth={3} /> : null}
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 7, marginTop: 14 }}>
                      <Txt weight="bold" style={{ fontSize: 26, color: palette.text }}>
                        {formatNumber(p.price)}
                      </Txt>
                      <Txt weight="semibold" style={{ fontSize: 13, color: palette.text3 }}>
                        FCFA
                      </Txt>
                      <View
                        style={{
                          marginLeft: 'auto',
                          backgroundColor: palette.surface3,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 999,
                        }}
                      >
                        <Txt weight="semibold" style={{ fontSize: 12.5, color: palette.text2 }}>
                          {p.qty} stickers
                        </Txt>
                      </View>
                    </View>
                    <View style={{ gap: 7, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: palette.border }}>
                      {p.features.map((f) => (
                        <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Icon name="checkCircle" size={16} color={palette.green} />
                          <Txt weight="medium" style={{ fontSize: 13.5, color: palette.text2 }}>
                            {f}
                          </Txt>
                        </View>
                      ))}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View>
            <Txt weight="bold" style={{ fontSize: 22, color: palette.text }}>
              Informations de livraison
            </Txt>
            <Txt weight="regular" style={{ fontSize: 14, color: palette.text2, marginTop: 4, marginBottom: 18 }}>
              Où souhaitez-vous recevoir vos stickers ?
            </Txt>
            <View style={{ gap: 14 }}>
              <Field label="Nom complet" icon="user" placeholder="Kouadio Jean" value={delivery.name} onChangeText={(v) => setD('name', v)} />
              <Field label="Téléphone" icon="phone" keyboardType="phone-pad" placeholder="07 XX XX XX XX" value={delivery.phone} onChangeText={(v) => setD('phone', v)} />
              <View>
                <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 8 }}>
                  Adresse de livraison
                </Txt>
                <TextInput
                  value={delivery.address}
                  onChangeText={(v) => setD('address', v)}
                  multiline
                  placeholder="Cocody Riviera 2, près de la pharmacie…"
                  placeholderTextColor={palette.text3}
                  style={{
                    minHeight: 88,
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
              <CitySelector value={delivery.city} onPress={() => cityRef.current?.present()} />

              {/* Promo */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <Icon name="tag" size={16} color={palette.text2} />
                  <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2 }}>
                    Code promo
                  </Txt>
                  <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3 }}>
                    (livraison offerte)
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      height: 54,
                      paddingHorizontal: 16,
                      borderRadius: radius.lg,
                      backgroundColor: palette.surface,
                      borderWidth: 1.5,
                      borderColor: delivery.promoOk ? palette.green : palette.border2,
                    }}
                  >
                    <TextInput
                      value={delivery.promo}
                      onChangeText={(v) => setD('promo', v)}
                      editable={!delivery.promoOk}
                      autoCapitalize="characters"
                      placeholder="RETROUVECI"
                      placeholderTextColor={palette.text3}
                      style={{ flex: 1, fontFamily: fontFamily.semibold, fontSize: 15.5, color: palette.text, padding: 0, letterSpacing: 0.5 }}
                    />
                    {delivery.promoOk ? <Icon name="checkCircle" size={20} color={palette.green} /> : null}
                  </View>
                  {!delivery.promoOk ? <Btn variant="ghost" size="md" label="Appliquer" onPress={applyPromo} /> : null}
                </View>
                <Txt weight="regular" style={{ fontSize: 12, color: palette.text3, marginTop: 8, lineHeight: 17 }}>
                  Sans code, la livraison est facturée {formatPrice(DELIVERY_FEE)} partout à Abidjan.
                </Txt>
              </View>

              <OrderRecap pack={pack} fee={fee} total={total} />
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View>
            <Txt weight="bold" style={{ fontSize: 22, color: palette.text }}>
              Paiement mobile
            </Txt>
            <Txt weight="regular" style={{ fontSize: 14, color: palette.text2, marginTop: 4, marginBottom: 18 }}>
              Choisissez votre moyen de paiement.
            </Txt>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {PAYMENT_METHODS.map((m) => {
                const on = m.id === payment.method;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setPayment((s) => ({ ...s, method: m.id }))}
                    style={{
                      width: '47.5%',
                      flexGrow: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 10,
                      padding: 13,
                      borderRadius: 15,
                      backgroundColor: palette.surface,
                      borderWidth: on ? 2 : 1.5,
                      borderColor: on ? palette.green : palette.border2,
                    }}
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: m.color, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="phone" size={20} color={m.dark ? '#1A1400' : '#FFFFFF'} strokeWidth={2.1} />
                    </View>
                    <Txt weight="semibold" style={{ flex: 1, fontSize: 13.5, color: palette.text }}>
                      {m.label}
                    </Txt>
                    {on ? (
                      <View style={{ position: 'absolute', top: 8, right: 8 }}>
                        <Icon name="checkCircle" size={17} color={palette.green} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: 18 }}>
              <Field
                label={`Numéro ${paymentMethod?.label ?? ''}`}
                icon="phone"
                keyboardType="phone-pad"
                placeholder="05 XX XX XX XX"
                value={payment.number}
                onChangeText={(v) => setPayment((s) => ({ ...s, number: v }))}
              />
              <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginTop: 8 }}>
                Vous recevrez une demande de paiement sur ce numéro.
              </Txt>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                marginTop: 16,
                padding: 13,
                borderRadius: 14,
                backgroundColor: palette.orangeSoft,
              }}
            >
              <Icon name="shield" size={19} color={palette.orangeDark} />
              <Txt weight="semibold" style={{ fontSize: 13, color: palette.orangeDark }}>
                Paiement sécurisé et crypté
              </Txt>
            </View>

            <View style={{ marginTop: 16 }}>
              <OrderRecap pack={pack} fee={fee} total={total} />
            </View>
          </View>
        ) : null}

        {step === 4 ? (
          <View style={{ alignItems: 'center', paddingTop: 12 }}>
            <View
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                backgroundColor: palette.greenSoft,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Icon name="checkCircle" size={42} color={palette.green} strokeWidth={1.8} />
            </View>
            <Txt weight="bold" style={{ fontSize: 24, color: palette.text }}>
              Commande confirmée !
            </Txt>
            <Txt
              weight="regular"
              style={{ fontSize: 14.5, color: palette.text2, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 300 }}
            >
              Merci pour votre commande. Vous recevrez vos {pack.qty} stickers QR dans les prochains jours.
            </Txt>

            <Card padding={18} style={{ marginTop: 24, width: '100%' }}>
              <Txt weight="bold" style={{ fontSize: 15.5, color: palette.text, marginBottom: 14 }}>
                Détails de la commande
              </Txt>
              <View style={{ gap: 11 }}>
                <Line
                  label="Numéro de commande"
                  value={<Txt style={{ fontFamily: fontFamily.medium, fontSize: 13, color: palette.text }}>{reference}</Txt>}
                />
                <Line label="Pack" value={`${pack.name} (${pack.qty} stickers)`} />
                <Line label="Sous-total" value={formatPrice(pack.price)} />
                <Line label="Livraison" value={fee === 0 ? 'Offerte' : formatPrice(fee)} valueColor={fee === 0 ? palette.green : undefined} />
                <View style={{ height: 1, backgroundColor: palette.border, marginVertical: 3 }} />
                <Line label="Total payé" value={<Txt weight="bold" style={{ fontSize: 13.5, color: palette.green }}>{formatPrice(total)}</Txt>} />
                <Line label="Paiement" value={paymentMethod?.label ?? ''} />
                <View style={{ height: 1, backgroundColor: palette.border, marginVertical: 3 }} />
                <View>
                  <Txt weight="regular" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 3 }}>
                    Livraison
                  </Txt>
                  <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text, lineHeight: 19 }}>
                    {delivery.address || '—'}
                    {delivery.city ? `, ${delivery.city}` : ''}
                  </Txt>
                </View>
              </View>
            </Card>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
              <View style={{ flex: 1 }}>
                <Btn
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon="qr"
                  label="Mes stickers"
                  onPress={() => {
                    setAccountSection('stickers');
                    router.replace('/compte');
                  }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Btn variant="primary" size="lg" fullWidth icon="home" label="Accueil" onPress={() => router.replace('/accueil')} />
              </View>
            </View>
            <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginTop: 16, textAlign: 'center' }}>
              Un SMS de confirmation a été envoyé au {delivery.phone || CURRENT_USER.phone}.
            </Txt>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky footer CTA */}
      {step < 4 ? (
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingBottom: insets.bottom + 14, paddingTop: 20 }}>
          <LinearGradient
            colors={['transparent', palette.bg] as const}
            locations={[0, 0.4]}
            style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
          />
          {step === 1 ? <Btn variant="primary" size="lg" fullWidth iconRight="arrowR" label="Continuer" onPress={() => setStep(2)} /> : null}
          {step === 2 ? (
            <Btn variant="primary" size="lg" fullWidth iconRight="arrowR" label="Continuer vers le paiement" disabled={!deliveryValid} onPress={() => setStep(3)} />
          ) : null}
          {step === 3 ? (
            <Btn
              variant="primary"
              size="lg"
              fullWidth
              icon={paying ? undefined : 'lock'}
              label={paying ? 'Paiement en cours…' : `Payer ${formatPrice(total)}`}
              loading={paying}
              disabled={!paymentValid || paying}
              onPress={goPay}
            />
          ) : null}
        </View>
      ) : null}

      {/* City picker */}
      <Sheet ref={cityRef} snapPoints={['62%']}>
        <Txt weight="bold" style={{ fontSize: 19, color: palette.text, marginBottom: 12 }}>
          Choisir une ville
        </Txt>
        <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 4 }}>
            {CITIES.map((c) => {
              const on = c === delivery.city;
              return (
                <Pressable
                  key={c}
                  onPress={() => {
                    setD('city', c);
                    cityRef.current?.dismiss();
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
                    {c}
                  </Txt>
                  {on ? <Icon name="check" size={20} color={palette.green} strokeWidth={2.4} /> : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Sheet>
    </View>
  );
}

function CitySelector({ value, onPress }: { value: string; onPress: () => void }) {
  const palette = usePalette();
  return (
    <View>
      <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 8 }}>
        Ville
      </Txt>
      <Pressable
        onPress={onPress}
        style={{
          height: 54,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 11,
          borderRadius: radius.lg,
          backgroundColor: palette.surface,
          borderWidth: 1.5,
          borderColor: value ? palette.green : palette.border2,
        }}
      >
        <Icon name="pin" size={19} color={value ? palette.green : palette.text3} />
        <Txt weight="semibold" style={{ flex: 1, fontSize: 15.5, color: palette.text }}>
          {value}
        </Txt>
        <Icon name="chevD" size={18} color={palette.text3} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}
