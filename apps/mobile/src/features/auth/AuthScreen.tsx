import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Btn, Field, IconBtn, MeshBg, Txt } from '@/components';
import { Icon } from '@/design/Icon';
import { shadows } from '@/design/tokens';
import { usePalette } from '@/design/useScheme';

import { OtpInput } from './OtpInput';

export type AuthView = 'login' | 'otp' | 'register' | 'forgot' | 'forgotSent';

interface AuthScreenProps {
  initialView?: AuthView;
  onAuthed: () => void;
  onClose: () => void;
}

export function AuthScreen({ initialView = 'login', onAuthed, onClose }: AuthScreenProps) {
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  const [view, setView] = useState<AuthView>(initialView);
  const [phone, setPhone] = useState('07 08 45 11 27');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [resend, setResend] = useState(28);

  useEffect(() => {
    if (view !== 'otp') return;
    setResend(28);
    const t = setInterval(() => setResend((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [view]);

  useEffect(() => {
    if (view === 'otp' && otp.length === 4) {
      const t = setTimeout(onAuthed, 420);
      return () => clearTimeout(t);
    }
  }, [otp, view, onAuthed]);

  const Header = ({ title, sub }: { title: string; sub?: string }) => (
    <View style={{ marginBottom: 30 }}>
      <Txt weight="bold" style={{ fontSize: 29, lineHeight: 33, color: palette.text }}>
        {title}
      </Txt>
      {sub ? (
        <Txt weight="regular" style={{ fontSize: 15.5, lineHeight: 23, color: palette.text2, marginTop: 11 }}>
          {sub}
        </Txt>
      ) : null}
    </View>
  );

  const back =
    view === 'login' || view === 'forgotSent' ? undefined : () => setView(view === 'register' || view === 'forgot' || view === 'otp' ? 'login' : 'login');

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <MeshBg />
      <View style={{ paddingTop: insets.top + 6, paddingHorizontal: 18 }}>
        <IconBtn name={back ? 'chevL' : 'close'} variant="ghost" onPress={back ?? onClose} />
      </View>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 26,
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {view === 'login' ? (
          <View style={{ flex: 1 }}>
            <View
              style={[
                {
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  backgroundColor: palette.green,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 26,
                },
                shadows.md,
              ]}
            >
              <Icon name="pin" size={28} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Header
              title="Connexion"
              sub="Entrez votre numéro pour recevoir un code de vérification par SMS."
            />
            <Field
              label="Numéro de téléphone"
              prefix="+225"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <Txt
              weight="semibold"
              onPress={() => setView('forgot')}
              style={{ alignSelf: 'flex-start', marginTop: 14, fontSize: 14.5, color: palette.green }}
            >
              Mot de passe oublié ?
            </Txt>
            <View style={{ marginTop: 'auto', paddingTop: 30, gap: 14 }}>
              <Btn variant="primary" fullWidth iconRight="arrowR" label="Recevoir le code" onPress={() => setView('otp')} />
              <Txt weight="regular" onPress={() => setView('register')} style={{ textAlign: 'center', fontSize: 15, color: palette.text2 }}>
                Pas encore de compte ? <Txt weight="semibold" style={{ color: palette.green }}>Créer un compte</Txt>
              </Txt>
            </View>
          </View>
        ) : null}

        {view === 'otp' ? (
          <View style={{ flex: 1 }}>
            <Header title="Vérification" sub={`Saisissez le code à 4 chiffres envoyé au +225 ${phone}.`} />
            <OtpInput value={otp} onChange={setOtp} />
            <View style={{ alignItems: 'center', marginTop: 26 }}>
              {resend > 0 ? (
                <Txt weight="regular" style={{ fontSize: 14.5, color: palette.text2 }}>
                  Renvoyer le code dans{' '}
                  <Txt weight="bold" style={{ color: palette.text }}>
                    0:{String(resend).padStart(2, '0')}
                  </Txt>
                </Txt>
              ) : (
                <Txt weight="semibold" onPress={() => setResend(28)} style={{ fontSize: 14.5, color: palette.green }}>
                  Renvoyer le code
                </Txt>
              )}
            </View>
            <View style={{ marginTop: 'auto', paddingTop: 30 }}>
              <Btn variant="primary" fullWidth label="Vérifier" disabled={otp.length < 4} onPress={onAuthed} />
              <Txt weight="regular" style={{ textAlign: 'center', fontSize: 12.5, color: palette.text3, marginTop: 16 }}>
                Astuce démo : saisissez 4 chiffres pour continuer.
              </Txt>
            </View>
          </View>
        ) : null}

        {view === 'register' ? (
          <View style={{ flex: 1 }}>
            <Header title="Créer un compte" sub="Quelques informations et vous êtes prêt à publier vos annonces." />
            <View style={{ gap: 16 }}>
              <Field label="Nom complet" icon="user" placeholder="Ex. Aya Koné" value={name} onChangeText={setName} />
              <Field
                label="Numéro de téléphone"
                prefix="+225"
                icon="phone"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Field
                label="Mot de passe"
                icon="lock"
                placeholder="••••••••"
                value={pwd}
                onChangeText={setPwd}
                secureTextEntry={!showPwd}
                right={showPwd ? 'eyeOff' : 'eye'}
                onRightPress={() => setShowPwd((s) => !s)}
              />
            </View>
            <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, lineHeight: 18, marginTop: 18 }}>
              En continuant, vous acceptez les Conditions d&apos;utilisation et la Politique de confidentialité de RetrouveCI.
            </Txt>
            <View style={{ marginTop: 'auto', paddingTop: 24, gap: 14 }}>
              <Btn variant="primary" fullWidth iconRight="arrowR" label="Continuer" onPress={() => setView('otp')} />
              <Txt weight="regular" onPress={() => setView('login')} style={{ textAlign: 'center', fontSize: 15, color: palette.text2 }}>
                Déjà inscrit ? <Txt weight="semibold" style={{ color: palette.green }}>Se connecter</Txt>
              </Txt>
            </View>
          </View>
        ) : null}

        {view === 'forgot' ? (
          <View style={{ flex: 1 }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                backgroundColor: palette.orangeSoft,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 26,
              }}
            >
              <Icon name="lock" size={26} color={palette.orangeDark} strokeWidth={2.1} />
            </View>
            <Header
              title="Mot de passe oublié"
              sub="Indiquez votre numéro. Nous vous enverrons un SMS pour réinitialiser votre mot de passe."
            />
            <Field
              label="Numéro de téléphone"
              prefix="+225"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <View style={{ marginTop: 'auto', paddingTop: 30 }}>
              <Btn variant="primary" fullWidth label="Envoyer le lien" onPress={() => setView('forgotSent')} />
            </View>
          </View>
        ) : null}

        {view === 'forgotSent' ? (
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 28,
                  backgroundColor: palette.greenSoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 26,
                }}
              >
                <Icon name="send" size={38} color={palette.green} strokeWidth={1.8} />
              </View>
              <Txt weight="bold" style={{ fontSize: 26, color: palette.text }}>
                SMS envoyé
              </Txt>
              <Txt
                weight="regular"
                style={{ fontSize: 15.5, lineHeight: 23, color: palette.text2, textAlign: 'center', marginTop: 12, maxWidth: 290 }}
              >
                Un lien de réinitialisation a été envoyé au +225 {phone}. Vérifiez vos messages.
              </Txt>
            </View>
            <Btn variant="primary" fullWidth label="Retour à la connexion" onPress={() => setView('login')} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
