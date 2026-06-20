import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  Btn,
  Card,
  EmptyState,
  Field,
  MeshBg,
  Sheet,
  Txt,
  type SheetRef,
} from '@/components';
import { Icon, type IconName } from '@/design/Icon';
import { usePalette } from '@/design/useScheme';
import { MY_ANNONCES, newAnnonceDraft, ORDERS, STICKERS } from '@/services/account.service';
import {
  ABIDJAN_COMMUNES,
  CITIES,
  CURRENT_USER,
  type MyAnnonce,
  type Sticker,
} from '@/services/types';
import { useAppStore } from '@/store/app.store';
import type { ThemeMode } from '@/store/types';

import { CommandeCard, MyAnnonceCard, StickerCard } from './AccountCards';
import { AnnonceEditSheet, type AnnonceDraft } from './AnnonceEditSheet';
import { ConfirmDialog } from './ConfirmDialog';
import { SectionTabs, type AccountTab } from './SectionTabs';
import { SettingRow, Toggle } from './SettingRow';
import { ShareSheet } from './ShareSheet';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: IconName }[] = [
  { value: 'light', label: 'Clair', icon: 'sun' },
  { value: 'dark', label: 'Sombre', icon: 'moon' },
  { value: 'auto', label: 'Auto', icon: 'refresh' },
];

type EditType = 'name' | 'phone' | 'zone' | 'password';

export function AccountScreen() {
  const palette = usePalette();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const section = useAppStore((s) => s.accountSection) as AccountTab;
  const setSection = useAppStore((s) => s.setAccountSection);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const showToast = useAppStore((s) => s.showToast);
  const logout = useAppStore((s) => s.logout);

  // Profile
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState(CURRENT_USER.name);
  const [phone, setPhone] = useState(CURRENT_USER.phone);
  const [city, setCity] = useState('Abidjan');
  const [commune, setCommune] = useState('Cocody');
  const zoneLabel = commune ? `${city} · ${commune}` : city;

  // Mes annonces
  const [annonces, setAnnonces] = useState<MyAnnonce[]>(MY_ANNONCES);
  const [draft, setDraft] = useState<AnnonceDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MyAnnonce | null>(null);
  const [shareSticker, setShareSticker] = useState<Sticker | null>(null);

  // Notifications
  const [notif, setNotif] = useState({ sms: true, push: true, email: false });

  // Edit profile sheet
  const [editType, setEditType] = useState<EditType | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; phone: string; city: string; commune: string; current: string; next: string; confirm: string; show: boolean }>(
    { name: '', phone: '', city: 'Abidjan', commune: '', current: '', next: '', confirm: '', show: false },
  );

  const annonceRef = useRef<SheetRef>(null);
  const shareRef = useRef<SheetRef>(null);
  const photoRef = useRef<SheetRef>(null);
  const editRef = useRef<SheetRef>(null);

  const tabs = [
    { id: 'annonces' as const, label: 'Mes annonces', icon: 'list' as const, count: annonces.length },
    { id: 'stickers' as const, label: 'Mes stickers', icon: 'qr' as const, count: STICKERS.length },
    { id: 'commandes' as const, label: 'Mes commandes', icon: 'package' as const, count: ORDERS.length },
    { id: 'params' as const, label: 'Paramètres', icon: 'settings' as const },
  ];

  /* ── Annonce actions ── */
  const openEditAnnonce = (a?: MyAnnonce) => {
    setDraft(a ? { ...a } : newAnnonceDraft());
    requestAnimationFrame(() => annonceRef.current?.present());
  };
  const saveAnnonce = (d: AnnonceDraft) => {
    const isNew = d.isNew;
    const clean: MyAnnonce = { ...d, isNew: undefined } as MyAnnonce;
    setAnnonces((list) => (list.some((x) => x.id === d.id) ? list.map((x) => (x.id === d.id ? clean : x)) : [clean, ...list]));
    showToast(isNew ? 'Annonce publiée' : 'Annonce modifiée');
    annonceRef.current?.dismiss();
  };
  const resolveAnnonce = (a: MyAnnonce) => {
    setAnnonces((list) => list.map((x) => (x.id === a.id ? { ...x, state: 'resolved' } : x)));
    showToast('Annonce marquée comme résolue');
  };
  const confirmDelete = () => {
    if (!pendingDelete) return;
    setAnnonces((list) => list.filter((x) => x.id !== pendingDelete.id));
    showToast('Annonce supprimée');
    setPendingDelete(null);
  };

  /* ── Photo ── */
  const setProfilePhoto = async (fromCamera: boolean) => {
    photoRef.current?.dismiss();
    const opts: ImagePicker.ImagePickerOptions = { allowsEditing: true, aspect: [1, 1], quality: 0.8, mediaTypes: ['images'] };
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
    if (!res.canceled) {
      setPhoto(res.assets[0].uri);
      showToast('Photo de profil mise à jour');
    }
  };

  /* ── Profile edit ── */
  const openEdit = (type: EditType) => {
    setEditType(type);
    setEditDraft({ name, phone, city, commune, current: '', next: '', confirm: '', show: false });
    requestAnimationFrame(() => editRef.current?.present());
  };
  const saveEdit = () => {
    if (editType === 'name') {
      setName(editDraft.name.trim() || name);
      showToast('Nom mis à jour');
    } else if (editType === 'phone') {
      setPhone(editDraft.phone.trim() || phone);
      showToast('Numéro mis à jour');
    } else if (editType === 'zone') {
      setCity(editDraft.city);
      setCommune(editDraft.city === 'Abidjan' ? editDraft.commune : '');
      showToast('Zone mise à jour');
    } else if (editType === 'password') {
      showToast('Mot de passe modifié');
    }
    editRef.current?.dismiss();
  };
  const editValid =
    editType === 'name'
      ? editDraft.name.trim().length > 0
      : editType === 'phone'
        ? editDraft.phone.replace(/\D/g, '').length >= 10
        : editType === 'zone'
          ? Boolean(editDraft.city) && (editDraft.city !== 'Abidjan' || Boolean(editDraft.commune))
          : editType === 'password'
            ? Boolean(editDraft.current) && editDraft.next.length >= 6 && editDraft.next === editDraft.confirm
            : false;

  const onLogout = async () => {
    await logout();
    router.replace('/accueil');
    showToast('Déconnecté');
  };

  return (
    <View style={{ flex: 1, backgroundColor: palette.bg }}>
      <MeshBg />

      {/* Profile header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <Pressable onPress={() => photoRef.current?.present()}>
            <Avatar name={name} uri={photo} size={62} />
            <View
              style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: palette.green,
                borderWidth: 2.5,
                borderColor: palette.bg,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="camera" size={12} color="#FFFFFF" strokeWidth={2.4} />
            </View>
          </Pressable>
          <View style={{ flex: 1 }}>
            <Txt weight="bold" style={{ fontSize: 20, color: palette.text }}>
              {name}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
              <Icon name="phone" size={14} color={palette.text2} />
              <Txt weight="medium" style={{ fontSize: 13.5, color: palette.text2 }}>
                {phone}
              </Txt>
            </View>
          </View>
        </View>
      </View>

      <SectionTabs tabs={tabs} active={section} onChange={setSection} />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {section === 'annonces' ? (
          annonces.length ? (
            <View style={{ gap: 12 }}>
              <Btn variant="soft" fullWidth icon="plus" size="md" label="Publier une annonce" onPress={() => openEditAnnonce()} />
              {annonces.map((a) => (
                <MyAnnonceCard
                  key={a.id}
                  annonce={a}
                  onResolve={() => resolveAnnonce(a)}
                  onEdit={() => openEditAnnonce(a)}
                  onDelete={() => setPendingDelete(a)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="list"
              title="Aucune annonce"
              text="Vous n'avez pas encore publié d'annonce."
              action={<Btn variant="soft" size="md" icon="plus" label="Publier une annonce" onPress={() => openEditAnnonce()} />}
            />
          )
        ) : null}

        {section === 'stickers' ? (
          <View style={{ gap: 12 }}>
            <Btn variant="accent" fullWidth icon="plus" size="md" label="Activer un sticker" onPress={() => router.push({ pathname: '/(modals)/scan', params: { activate: '1' } })} />
            {STICKERS.map((s) => (
              <StickerCard
                key={s.id}
                sticker={s}
                onActivate={() => router.push({ pathname: '/(modals)/scan', params: { activate: '1' } })}
                onShare={() => {
                  setShareSticker(s);
                  requestAnimationFrame(() => shareRef.current?.present());
                }}
              />
            ))}
          </View>
        ) : null}

        {section === 'commandes' ? (
          <View style={{ gap: 12 }}>
            <Card padding={16} style={{ borderWidth: 0, overflow: 'hidden' }}>
              <LinearGradient
                colors={[palette.green, palette.greenDark] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
                <View
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="qr" size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt weight="bold" style={{ fontSize: 15.5, color: '#FFFFFF' }}>
                    Besoin de stickers ?
                  </Txt>
                  <Txt weight="regular" style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                    À partir de 2 000 FCFA le pack
                  </Txt>
                </View>
                <Btn variant="glass" size="sm" label="Commander" onPress={() => router.push('/(modals)/order')} />
              </View>
            </Card>
            {ORDERS.map((o) => (
              <CommandeCard key={o.id} order={o} />
            ))}
          </View>
        ) : null}

        {section === 'params' ? (
          <View style={{ gap: 18 }}>
            <SettingsGroup label="Apparence">
              <Card padding={14}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 14 }}>
                  <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: palette.greenSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="eye" size={19} color={palette.green} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt weight="semibold" style={{ fontSize: 15, color: palette.text }}>
                      Thème
                    </Txt>
                    <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, marginTop: 1 }}>
                      Choisissez l&apos;apparence de l&apos;app
                    </Txt>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {THEME_OPTIONS.map((o) => {
                    const on = theme === o.value;
                    return (
                      <Pressable
                        key={o.value}
                        onPress={() => setTheme(o.value)}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          gap: 7,
                          paddingVertical: 14,
                          borderRadius: 14,
                          backgroundColor: on ? palette.greenSoft : palette.surface2,
                          borderWidth: 1.5,
                          borderColor: on ? palette.green : 'transparent',
                        }}
                      >
                        <Icon name={o.icon} size={21} color={on ? palette.green : palette.text2} />
                        <Txt weight="semibold" style={{ fontSize: 13, color: on ? palette.green : palette.text2 }}>
                          {o.label}
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>
            </SettingsGroup>

            <SettingsGroup label="Informations personnelles">
              <Card padding={0}>
                <SettingRow icon="user" label="Nom et prénoms" sub={name} onPress={() => openEdit('name')} />
                <Divider />
                <SettingRow icon="phone" label="Numéro de téléphone" sub={phone} onPress={() => openEdit('phone')} />
                <Divider />
                <SettingRow icon="pin" label="Zone" sub={zoneLabel} onPress={() => openEdit('zone')} />
              </Card>
            </SettingsGroup>

            <SettingsGroup label="Sécurité">
              <Card padding={0}>
                <SettingRow icon="lock" label="Mot de passe" sub="Modifié il y a 2 mois" onPress={() => openEdit('password')} />
                <Divider />
                <SettingRow icon="shield" label="Code PIN de sécurité" right={<Toggle on onToggle={() => showToast('Code PIN')} />} />
              </Card>
            </SettingsGroup>

            <SettingsGroup label="Notifications">
              <Card padding={0}>
                <SettingRow icon="bell" label="Notifications SMS" right={<Toggle on={notif.sms} onToggle={() => setNotif((n) => ({ ...n, sms: !n.sms }))} />} />
                <Divider />
                <SettingRow icon="phone" label="Notifications push" right={<Toggle on={notif.push} onToggle={() => setNotif((n) => ({ ...n, push: !n.push }))} />} />
                <Divider />
                <SettingRow icon="send" label="Notifications e-mail" right={<Toggle on={notif.email} onToggle={() => setNotif((n) => ({ ...n, email: !n.email }))} />} />
              </Card>
            </SettingsGroup>

            <SettingsGroup label="Zone de danger" danger>
              <Card padding={0} style={{ borderColor: palette.orangeSoft2 }}>
                <SettingRow icon="logout" label="Se déconnecter" onPress={onLogout} />
                <Divider />
                <SettingRow icon="trash" label="Supprimer mon compte" sub="Action irréversible" danger onPress={() => showToast('Suppression du compte')} />
              </Card>
            </SettingsGroup>

            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Txt weight="bold" style={{ fontSize: 14, color: palette.text }}>
                RetrouveCI
              </Txt>
              <Txt weight="regular" style={{ fontSize: 12, color: palette.text3, marginTop: 2 }}>
                Version 1.0.0 · Côte d&apos;Ivoire 🇨🇮
              </Txt>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Sheets & dialogs */}
      <AnnonceEditSheet ref={annonceRef} draft={draft} onSave={saveAnnonce} />
      <ShareSheet ref={shareRef} sticker={shareSticker} onShare={(label) => { shareRef.current?.dismiss(); showToast(`Partagé via ${label}`); }} />
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        danger
        title="Supprimer l'annonce ?"
        message={pendingDelete ? `« ${pendingDelete.title} » sera définitivement retirée. Cette action est irréversible.` : ''}
        confirmLabel="Supprimer"
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Photo source chooser */}
      <Sheet ref={photoRef}>
        <Txt weight="bold" style={{ fontSize: 19, color: palette.text, marginBottom: 16 }}>
          Photo de profil
        </Txt>
        <View style={{ gap: 10 }}>
          <Btn variant="primary" size="lg" fullWidth icon="camera" label="Prendre une photo" onPress={() => setProfilePhoto(true)} />
          <Btn variant="ghost" size="lg" fullWidth icon="image" label="Choisir dans la galerie" onPress={() => setProfilePhoto(false)} />
          {photo ? (
            <Btn variant="ghost" size="lg" fullWidth icon="trash" label="Supprimer la photo" onPress={() => { setPhoto(null); photoRef.current?.dismiss(); showToast('Photo supprimée'); }} />
          ) : null}
        </View>
      </Sheet>

      {/* Profile edit sheet */}
      <Sheet ref={editRef} snapPoints={editType === 'zone' ? ['72%'] : undefined}>
        <Txt weight="bold" style={{ fontSize: 19, color: palette.text, marginBottom: 16 }}>
          {editType === 'name' ? 'Nom et prénoms' : editType === 'phone' ? 'Numéro de téléphone' : editType === 'zone' ? 'Zone' : 'Mot de passe'}
        </Txt>

        {editType === 'name' ? (
          <Field label="Nom et prénoms" icon="user" placeholder="Adjoua Konan" value={editDraft.name} onChangeText={(v) => setEditDraft((d) => ({ ...d, name: v }))} autoFocus />
        ) : null}

        {editType === 'phone' ? (
          <View style={{ gap: 10 }}>
            <Field label="Numéro de téléphone" icon="phone" prefix="+225" keyboardType="phone-pad" value={editDraft.phone} onChangeText={(v) => setEditDraft((d) => ({ ...d, phone: v }))} autoFocus />
            <Txt weight="regular" style={{ fontSize: 12.5, color: palette.text3, lineHeight: 18 }}>
              Un code de confirmation vous sera envoyé par SMS pour valider ce nouveau numéro.
            </Txt>
          </View>
        ) : null}

        {editType === 'zone' ? (
          <View style={{ gap: 18 }}>
            <ChipGroup label="Ville" options={CITIES} value={editDraft.city} onPick={(v) => setEditDraft((d) => ({ ...d, city: v, commune: v === 'Abidjan' ? d.commune : '' }))} />
            {editDraft.city === 'Abidjan' ? (
              <ChipGroup label="Commune" options={ABIDJAN_COMMUNES} value={editDraft.commune} onPick={(v) => setEditDraft((d) => ({ ...d, commune: v }))} />
            ) : null}
          </View>
        ) : null}

        {editType === 'password' ? (
          <View style={{ gap: 14 }}>
            <Field label="Mot de passe actuel" icon="lock" placeholder="••••••••" secureTextEntry={!editDraft.show} right={editDraft.show ? 'eyeOff' : 'eye'} onRightPress={() => setEditDraft((d) => ({ ...d, show: !d.show }))} value={editDraft.current} onChangeText={(v) => setEditDraft((d) => ({ ...d, current: v }))} autoFocus />
            <Field label="Nouveau mot de passe" icon="lock" placeholder="6 caractères minimum" secureTextEntry={!editDraft.show} value={editDraft.next} onChangeText={(v) => setEditDraft((d) => ({ ...d, next: v }))} />
            <Field label="Confirmer le mot de passe" icon="lock" placeholder="••••••••" secureTextEntry={!editDraft.show} value={editDraft.confirm} onChangeText={(v) => setEditDraft((d) => ({ ...d, confirm: v }))} />
            {editDraft.next && editDraft.confirm && editDraft.next !== editDraft.confirm ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <Icon name="info" size={15} color={palette.orangeDark} strokeWidth={2.2} />
                <Txt weight="semibold" style={{ fontSize: 12.5, color: palette.orangeDark }}>
                  Les mots de passe ne correspondent pas.
                </Txt>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={{ marginTop: 22 }}>
          <Btn variant="primary" size="lg" fullWidth icon={editType === 'phone' ? 'send' : 'check'} label={editType === 'phone' ? 'Envoyer le code' : 'Enregistrer'} disabled={!editValid} onPress={saveEdit} />
        </View>
      </Sheet>
    </View>
  );
}

function SettingsGroup({ label, danger, children }: { label: string; danger?: boolean; children: React.ReactNode }) {
  const palette = usePalette();
  return (
    <View>
      <Txt weight="bold" style={{ fontSize: 12.5, letterSpacing: 0.5, color: danger ? palette.orangeDark : palette.text3, marginBottom: 8, marginLeft: 4 }}>
        {label.toUpperCase()}
      </Txt>
      {children}
    </View>
  );
}

function Divider() {
  const palette = usePalette();
  return <View style={{ height: 1, backgroundColor: palette.border, marginLeft: 65 }} />;
}

function ChipGroup({ label, options, value, onPick }: { label: string; options: readonly string[]; value: string; onPick: (v: string) => void }) {
  const palette = usePalette();
  return (
    <View>
      <Txt weight="semibold" style={{ fontSize: 13.5, color: palette.text2, marginBottom: 10 }}>
        {label}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const on = o === value;
          return (
            <Pressable
              key={o}
              onPress={() => onPick(o)}
              style={{
                height: 38,
                paddingHorizontal: 15,
                justifyContent: 'center',
                borderRadius: 999,
                backgroundColor: on ? palette.green : palette.surface2,
                borderWidth: 1.5,
                borderColor: on ? palette.green : palette.border2,
              }}
            >
              <Txt weight="semibold" style={{ fontSize: 14, color: on ? '#FFFFFF' : palette.text2 }}>
                {o}
              </Txt>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
