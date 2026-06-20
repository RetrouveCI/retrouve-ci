import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Card, Field, IconBtn, MeshBg, ObjectThumb, StatusBadge, Txt } from '@/components';
import { fontFamily } from '@/design/fonts';
import { Icon } from '@/design/Icon';
import { QRCode } from '@/design/QRCode';
import { shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';
import { useAnnonces } from '@/services/annonces.service';
import { useAppStore } from '@/store/app.store';

type Phase = 'scanning' | 'result';
type Outcome = 'registered' | 'unregistered' | 'unknown';

const BLANK_CODE = 'RC-A03-66B';
const KNOWN_CODE = 'RC-7K2-9XQ';
const SCANNED_ID = 'a2'; // demo registered sticker → reported lost

/** Map a scanned QR string to a flow outcome (demo logic — no backend yet). */
function outcomeForCode(data: string): Outcome {
  if (data.includes(BLANK_CODE)) return 'unregistered';
  if (/RC-[A-Z0-9]{3}-[A-Z0-9]{3}/i.test(data)) return 'registered';
  return 'unknown';
}

export function ScanFlow({ activate = false }: { activate?: boolean }) {
  const router = useRouter();
  const authed = useAppStore((s) => s.isAuthenticated);
  const showToast = useAppStore((s) => s.showToast);
  const setAccountSection = useAppStore((s) => s.setAccountSection);

  const [phase, setPhase] = useState<Phase>('scanning');
  const [outcome, setOutcome] = useState<Outcome>(activate ? 'unregistered' : 'registered');
  const [activated, setActivated] = useState(false);
  const [objName, setObjName] = useState('');
  const resolved = useRef(false);

  const { data: annonces = [] } = useAnnonces();
  const scanned = annonces.find((a) => a.id === SCANNED_ID);

  const close = () => router.back();

  const resolve = (next: Outcome) => {
    if (resolved.current) return;
    resolved.current = true;
    setOutcome(next);
    setPhase('result');
  };

  const rescan = (next?: Outcome) => {
    resolved.current = false;
    setActivated(false);
    setObjName('');
    if (next) setOutcome(next);
    setPhase('scanning');
  };

  // Fallback auto-resolve so the demo proceeds without a physical sticker.
  useEffect(() => {
    if (phase !== 'scanning') return;
    const t = setTimeout(() => resolve(activate ? 'unregistered' : 'registered'), 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const openAnnonce = () => {
    if (!scanned) return;
    router.replace(`/annonce/${scanned.id}`);
  };
  const onActivated = (name: string) => {
    setAccountSection('stickers');
    router.replace('/compte');
    showToast('Sticker activé : ' + name, 'checkCircle');
  };
  const onAuth = (view: 'login' | 'register') => {
    router.replace({ pathname: '/(modals)/auth', params: { view } });
  };

  if (phase === 'scanning') {
    return <ScanningView flash={false} onClose={close} onCode={(d) => resolve(outcomeForCode(d))} />;
  }

  if (outcome === 'unknown') return <UnknownResult onClose={close} onRescan={() => rescan('registered')} />;
  if (outcome === 'registered' && scanned)
    return (
      <RegisteredResult
        annonce={scanned}
        onClose={close}
        onContact={openAnnonce}
        onRescan={() => rescan('unknown')}
      />
    );
  if (activated)
    return (
      <ActivatedResult
        code={BLANK_CODE}
        name={objName}
        onClose={close}
        onSeeStickers={() => onActivated(objName)}
        onRescan={() => rescan('unregistered')}
      />
    );
  if (authed)
    return (
      <ConfigureResult
        code={BLANK_CODE}
        name={objName}
        onName={setObjName}
        onClose={close}
        onActivate={() => setActivated(true)}
      />
    );
  return <CreateAccountResult code={BLANK_CODE} onClose={close} onAuth={onAuth} />;
}

/* ─────────────── Scanning ─────────────── */

function ScanningView({
  flash: initialFlash,
  onClose,
  onCode,
}: {
  flash: boolean;
  onClose: () => void;
  onCode: (data: string) => void;
}) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(initialFlash);
  const scanLine = useSharedValue(8);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission?.granted, requestPermission]);

  useEffect(() => {
    scanLine.value = withRepeat(withTiming(238, { duration: 1100 }), -1, true);
  }, [scanLine]);

  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: scanLine.value }] }));
  const corners = [
    { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 },
    { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 },
    { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 },
    { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0d0b' }}>
      {permission?.granted ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => onCode(data)}
        />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(6,8,7,0.35)' }]} />

      {/* Top bar */}
      <View
        style={{
          position: 'absolute',
          top: insets.top + 6,
          left: 18,
          right: 18,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <IconBtn name="close" variant="glass" onPress={onClose} />
        <Txt weight="semibold" style={{ color: '#FFFFFF', fontSize: 16 }}>
          Scanner un sticker
        </Txt>
        <Pressable
          onPress={() => setTorch((f) => !f)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 44 / 2.6,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.14)',
          }}
        >
          <Icon name="flash" size={21} color={torch ? palette.orangeLight : '#FFFFFF'} />
        </Pressable>
      </View>

      {/* Viewfinder */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 256, height: 256 }}>
          <View
            style={{
              position: 'absolute',
              top: 30,
              left: 30,
              right: 30,
              bottom: 30,
              opacity: 0.18,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCode value={KNOWN_CODE} size={180} fg="#ffffff" />
          </View>
          {corners.map((c, i) => (
            <View
              key={i}
              style={{ position: 'absolute', width: 44, height: 44, borderColor: palette.orangeLight, ...c }}
            />
          ))}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: 8,
                right: 8,
                height: 3,
                borderRadius: 3,
                backgroundColor: palette.orangeLight,
              },
              lineStyle,
            ]}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 38 }}>
          <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: palette.orangeLight }} />
          <Txt weight="medium" style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>
            Recherche d&apos;un QR code…
          </Txt>
        </View>
        <Txt
          weight="regular"
          style={{
            marginTop: 8,
            fontSize: 13.5,
            color: 'rgba(255,255,255,0.55)',
            textAlign: 'center',
            maxWidth: 260,
          }}
        >
          Placez le sticker RetrouveCI dans le cadre
        </Txt>
      </View>

      {/* Bottom info */}
      <View
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: insets.bottom + 24,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 11,
          padding: 14,
          borderRadius: 18,
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.12)',
        }}
      >
        <Icon name="info" size={20} color="rgba(255,255,255,0.85)" />
        <Txt weight="regular" style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 }}>
          Chaque sticker possède un code unique relié à son propriétaire.
        </Txt>
      </View>
    </View>
  );
}

/* ─────────────── Result shell ─────────────── */

function ResultShell({
  accent,
  onClose,
  children,
}: {
  accent?: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <MeshBg accent={accent} />
      <View
        style={{
          paddingTop: insets.top + 6,
          paddingHorizontal: 18,
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}
      >
        <IconBtn name="close" variant="ghost" onPress={onClose} />
      </View>
      <View
        style={{ flex: 1, paddingHorizontal: 24, paddingBottom: insets.bottom + 24, paddingTop: 4 }}
      >
        {children}
      </View>
    </View>
  );
}

function MonoLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Txt style={{ fontFamily: fontFamily.medium, fontSize: 12, letterSpacing: 2, color, marginTop: 18 }}>
      {children}
    </Txt>
  );
}

/* ─────────────── Registered ─────────────── */

function RegisteredResult({
  annonce,
  onClose,
  onContact,
  onRescan,
}: {
  annonce: NonNullable<ReturnType<typeof useAnnonces>['data']>[number];
  onClose: () => void;
  onContact: () => void;
  onRescan: () => void;
}) {
  const palette = usePalette();
  return (
    <ResultShell accent onClose={onClose}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={[
            {
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: palette.green,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadows.md,
          ]}
        >
          <Icon name="checkCircle" size={38} color="#FFFFFF" />
        </View>
        <MonoLabel color={palette.green}>STICKER {KNOWN_CODE}</MonoLabel>
        <Txt weight="bold" style={{ fontSize: 26, color: palette.text, marginTop: 8 }}>
          Sticker reconnu !
        </Txt>
        <Txt
          weight="regular"
          style={{ fontSize: 15, color: palette.text2, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 300 }}
        >
          Cet objet a été signalé comme perdu par son propriétaire. Aidez-le à le retrouver.
        </Txt>
      </View>

      <Card padding={13} onPress={onContact} style={{ marginTop: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <ObjectThumb tone={annonce.tone} radius={13} iconSize={24} style={{ width: 64, height: 64 }} />
          <View style={{ flex: 1 }}>
            <StatusBadge status={annonce.status} size="sm" />
            <Txt weight="semibold" style={{ fontSize: 15, color: palette.text, marginTop: 6 }}>
              {annonce.title}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5 }}>
              <Icon name="pin" size={13} color={palette.text3} />
              <Txt weight="medium" style={{ fontSize: 12.5, color: palette.text3 }}>
                {annonce.commune ? `${annonce.commune}, ${annonce.city}` : annonce.city}
              </Txt>
            </View>
          </View>
          <Icon name="chevR" size={20} color={palette.text3} strokeWidth={2.2} />
        </View>
      </Card>

      <View style={{ marginTop: 'auto', paddingTop: 26, gap: 12 }}>
        <Btn variant="primary" fullWidth icon="phone" label="Contacter le propriétaire" onPress={onContact} />
        <Btn variant="ghost" fullWidth icon="qr" label="Scanner un autre sticker" onPress={onRescan} />
      </View>
    </ResultShell>
  );
}

/* ─────────────── Unknown ─────────────── */

function UnknownResult({ onClose, onRescan }: { onClose: () => void; onRescan: () => void }) {
  const palette = usePalette();
  return (
    <ResultShell accent onClose={onClose}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: palette.orangeSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="alert" size={34} color={palette.orangeDark} />
        </View>
        <MonoLabel color={palette.orangeDark}>QR NON RECONNU</MonoLabel>
        <Txt weight="bold" style={{ fontSize: 25, color: palette.text, marginTop: 8, textAlign: 'center', lineHeight: 29 }}>
          Ce QR code n&apos;est pas un sticker RetrouveCI
        </Txt>
        <Txt
          weight="regular"
          style={{ fontSize: 15, color: palette.text2, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 304 }}
        >
          Le code scanné ne correspond à aucun sticker de notre service. Assurez-vous de scanner un sticker RetrouveCI officiel.
        </Txt>
      </View>

      <Card padding={14} style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: palette.greenSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="info" size={20} color={palette.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt weight="semibold" style={{ fontSize: 14, color: palette.text }}>
              Comment le reconnaître ?
            </Txt>
            <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text2, marginTop: 2, lineHeight: 17 }}>
              Un sticker officiel porte un code au format RC-XXX-XXX.
            </Txt>
          </View>
        </View>
      </Card>

      <View style={{ marginTop: 'auto', paddingTop: 26, gap: 12 }}>
        <Btn variant="primary" fullWidth icon="qr" label="Scanner à nouveau" onPress={onRescan} />
        <Btn variant="ghost" fullWidth label="Fermer" onPress={onClose} />
      </View>
    </ResultShell>
  );
}

/* ─────────────── Activated ─────────────── */

function ActivatedResult({
  code,
  name,
  onClose,
  onSeeStickers,
  onRescan,
}: {
  code: string;
  name: string;
  onClose: () => void;
  onSeeStickers: () => void;
  onRescan: () => void;
}) {
  const palette = usePalette();
  return (
    <ResultShell onClose={onClose}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={[
            {
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: palette.green,
              alignItems: 'center',
              justifyContent: 'center',
            },
            shadows.md,
          ]}
        >
          <Icon name="checkCircle" size={38} color="#FFFFFF" />
        </View>
        <Txt weight="bold" style={{ fontSize: 26, color: palette.text, marginTop: 18 }}>
          Sticker activé !
        </Txt>
        <Txt
          weight="regular"
          style={{ fontSize: 15, color: palette.text2, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 300 }}
        >
          Ce sticker est désormais lié à votre compte et à {name}.
        </Txt>
      </View>

      <Card padding={16} style={{ marginTop: 26 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: palette.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QRCode value={code} size={52} fg="#14171A" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt style={{ fontFamily: fontFamily.medium, fontSize: 12.5, color: palette.text2, letterSpacing: 0.5 }}>
              {code}
            </Txt>
            <Txt weight="semibold" style={{ fontSize: 15, color: palette.text, marginTop: 4 }}>
              {name}
            </Txt>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                alignSelf: 'flex-start',
                marginTop: 8,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: 999,
                backgroundColor: palette.greenSoft,
              }}
            >
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.green }} />
              <Txt weight="semibold" style={{ fontSize: 11.5, color: palette.green }}>
                Actif
              </Txt>
            </View>
          </View>
        </View>
      </Card>

      <View style={{ marginTop: 'auto', paddingTop: 26, gap: 12 }}>
        <Btn variant="primary" fullWidth icon="qr" label="Voir mes stickers" onPress={onSeeStickers} />
        <Btn variant="ghost" fullWidth icon="camera" label="Activer un autre sticker" onPress={onRescan} />
      </View>
    </ResultShell>
  );
}

/* ─────────────── Configure (logged in) ─────────────── */

function ConfigureResult({
  code,
  name,
  onName,
  onClose,
  onActivate,
}: {
  code: string;
  name: string;
  onName: (v: string) => void;
  onClose: () => void;
  onActivate: () => void;
}) {
  const palette = usePalette();
  return (
    <ResultShell onClose={onClose}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: palette.greenSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="tag" size={34} color={palette.green} />
        </View>
        <MonoLabel color={palette.green}>STICKER {code}</MonoLabel>
        <Txt weight="bold" style={{ fontSize: 25, color: palette.text, marginTop: 8 }}>
          Configurer ce sticker
        </Txt>
        <Txt
          weight="regular"
          style={{ fontSize: 15, color: palette.text2, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 300 }}
        >
          Ce sticker n&apos;est lié à aucun objet. Donnez-lui un nom pour l&apos;activer sur votre compte.
        </Txt>
      </View>

      <View style={{ marginTop: 26 }}>
        <Field
          label="Nom de l'objet"
          icon="package"
          placeholder="Ex. Trousseau de clés, sac, ordinateur…"
          value={name}
          onChangeText={onName}
          autoFocus
        />
        <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, lineHeight: 18, marginTop: 12 }}>
          En cas de perte, toute personne qui scanne ce sticker pourra vous contacter sans voir votre numéro.
        </Txt>
      </View>

      <View style={{ marginTop: 'auto', paddingTop: 26, gap: 12 }}>
        <Btn
          variant="primary"
          fullWidth
          icon="check"
          label="Activer le sticker"
          disabled={!name.trim()}
          onPress={onActivate}
        />
        <Btn variant="ghost" fullWidth label="Annuler" onPress={onClose} />
      </View>
    </ResultShell>
  );
}

/* ─────────────── Create account (not logged in) ─────────────── */

const STEPS = [
  { icon: 'user' as const, title: 'Créez votre compte', body: 'Inscription rapide par téléphone.' },
  { icon: 'camera' as const, title: 'Rescannez le sticker', body: 'Une fois connecté, scannez-le à nouveau.' },
  { icon: 'tag' as const, title: 'Nommez votre objet', body: 'Le sticker est activé sur votre compte.' },
];

function CreateAccountResult({
  code,
  onClose,
  onAuth,
}: {
  code: string;
  onClose: () => void;
  onAuth: (view: 'login' | 'register') => void;
}) {
  const palette = usePalette();
  return (
    <ResultShell accent onClose={onClose}>
      <View style={{ alignItems: 'center' }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: palette.orangeSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="qr" size={34} color={palette.orangeDark} />
        </View>
        <MonoLabel color={palette.orangeDark}>STICKER {code}</MonoLabel>
        <Txt weight="bold" style={{ fontSize: 25, color: palette.text, marginTop: 8 }}>
          Sticker non activé
        </Txt>
        <Txt
          weight="regular"
          style={{ fontSize: 15, color: palette.text2, lineHeight: 22, textAlign: 'center', marginTop: 10, maxWidth: 304 }}
        >
          Ce sticker n&apos;est lié à aucun compte. Créez votre compte pour l&apos;activer, puis scannez-le à nouveau pour le configurer.
        </Txt>
      </View>

      <Card padding={0} style={{ marginTop: 24 }}>
        {STEPS.map((s, i) => (
          <View key={s.title}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 9,
                  backgroundColor: palette.orange,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt weight="bold" style={{ fontSize: 13, color: '#FFFFFF' }}>
                  {i + 1}
                </Txt>
              </View>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: palette.orangeSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={s.icon} size={20} color={palette.orangeDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt weight="semibold" style={{ fontSize: 14.5, color: palette.text }}>
                  {s.title}
                </Txt>
                <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text2, marginTop: 2 }}>
                  {s.body}
                </Txt>
              </View>
            </View>
            {i < STEPS.length - 1 ? (
              <View style={{ height: 1, backgroundColor: palette.border, marginLeft: 67 }} />
            ) : null}
          </View>
        ))}
      </Card>

      <View style={{ marginTop: 'auto', paddingTop: 26, gap: 12 }}>
        <Btn variant="accent" fullWidth icon="user" label="Créer un compte" onPress={() => onAuth('register')} />
        <Btn variant="ghost" fullWidth label="J'ai déjà un compte" onPress={() => onAuth('login')} />
      </View>
    </ResultShell>
  );
}
