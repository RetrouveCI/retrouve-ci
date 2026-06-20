# Prompt Claude Code — App mobile RetrouveCI (Expo) dans Turborepo

---

## Contexte

Tu travailles sur le monorepo **RetrouveCI** (Wiserve Group), une plateforme
ivoirienne de lost & found basée sur des stickers QR. Le repo Turborepo contient
déjà :

```
apps/
  client/          ← React Router v7 (frontend utilisateur)
  admin/           ← React Router v7 (back-office)
  api/             ← NestJS (backend, API REST + Swagger)
packages/
  ui/              ← (si existant) composants partagés
  types/           ← (si existant) types/DTOs partagés
turbo.json
package.json       ← root workspace
```

Ta mission : **ajouter `apps/mobile/`** — une application Expo (React Native)
qui consomme la même API NestJS que les apps web, et dont le design reproduit
fidèlement la maquette Claude Design.

---

## 1. Stack à installer

### Runtime

- `expo` (SDK 52+, managed workflow)
- `react-native` (version imposée par Expo SDK)
- `typescript` strict
- EAS CLI en devDependency root

### Navigation

- `expo-router` v4 (file-based routing)
- `react-native-screens`
- `react-native-safe-area-context`

### Design system

- `nativewind` v4
- `tailwindcss`
- `react-native-reusables` (primitives non-stylées)
- `react-native-svg` (pour le composant Icon custom)
- `expo-blur` (TabBar glassmorphic)
- `expo-font` (police Geist en local)
- `@gorhom/bottom-sheet` + `react-native-gesture-handler` +
  `react-native-reanimated`

### Data & state

- `@tanstack/react-query` v5
- `zustand`
- `react-hook-form`
- `zod`

### Fonctionnalités natives

- `expo-camera` (QR scan)
- `expo-notifications`
- `expo-secure-store`
- `expo-image-picker`
- `expo-web-browser` (paiement mobile money)

### Intégration API

- `orval` en devDependency (génère le client depuis le Swagger NestJS)
- `axios` (client HTTP)

### Qualité

- `sentry-expo` (crash reporting)
- `jest` + `@testing-library/react-native`
- ESLint + Prettier (config partagée depuis root si elle existe)

---

## 2. Structure de fichiers à créer

```
apps/mobile/
├── app.json                          ← config Expo
├── babel.config.js
├── tailwind.config.ts
├── metro.config.js
├── tsconfig.json                     ← extends ../../tsconfig.base.json
├── package.json
│
├── app/                              ← Expo Router (file-based)
│   ├── _layout.tsx                   ← Root layout : fonts, thème, QueryClient, toast
│   ├── (tabs)/
│   │   ├── _layout.tsx               ← TabBar custom (glassmorphic)
│   │   ├── accueil.tsx               ← Écran Home
│   │   ├── annonces.tsx              ← Écran Listings
│   │   └── compte.tsx                ← Écran Account (ou AuthGate)
│   ├── (modals)/
│   │   ├── scan.tsx                  ← Overlay plein écran scanner QR
│   │   ├── auth.tsx                  ← Overlay auth OTP
│   │   └── order.tsx                 ← Flow commande stickers
│   ├── annonce/
│   │   └── [id].tsx                  ← Détail annonce (bottom sheet)
│   └── onboarding.tsx                ← 3 slides one-time
│
├── src/
│   ├── design/
│   │   ├── tokens.ts                 ← Couleurs, shadows, radius (sync avec tailwind.config)
│   │   ├── Icon.tsx                  ← Composant SVG custom (ICON_PATHS)
│   │   └── fonts.ts                  ← Définitions expo-font
│   │
│   ├── components/                   ← Primitives UI réutilisables
│   │   ├── Btn.tsx
│   │   ├── Card.tsx
│   │   ├── Sheet.tsx                 ← Wrapper @gorhom/bottom-sheet
│   │   ├── Field.tsx
│   │   ├── Avatar.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── ObjectThumb.tsx
│   │   ├── Toast.tsx
│   │   ├── MeshBg.tsx
│   │   ├── Skeleton.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Chip.tsx
│   │   ├── OtpInput.tsx
│   │   └── QRCode.tsx
│   │
│   ├── features/
│   │   ├── home/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── AnnonceCardH.tsx      ← Card horizontale (scroll home)
│   │   │   ├── StatPill.tsx
│   │   │   └── NotificationsSheet.tsx
│   │   ├── listings/
│   │   │   ├── ListingsScreen.tsx
│   │   │   ├── AnnonceRow.tsx
│   │   │   ├── FiltersSheet.tsx
│   │   │   └── AnnonceDetail.tsx
│   │   ├── scan/
│   │   │   └── ScanFlow.tsx          ← phases: scanning → result (registered/unregistered)
│   │   ├── auth/
│   │   │   ├── AuthScreen.tsx        ← views: login → otp → register → forgot → forgotSent
│   │   │   └── OtpInput.tsx
│   │   ├── account/
│   │   │   ├── AccountScreen.tsx
│   │   │   ├── StickerCard.tsx
│   │   │   ├── MyAnnonceCard.tsx
│   │   │   └── CommandeCard.tsx
│   │   ├── order/
│   │   │   ├── OrderFlow.tsx         ← steps: Pack → Livraison → Paiement → Confirmé
│   │   │   └── OrderStepper.tsx
│   │   └── onboarding/
│   │       └── OnboardingScreen.tsx  ← 3 slides avec illustrations SVG
│   │
│   ├── services/                     ← Couche API (client généré par orval ou manuel)
│   │   ├── api.client.ts             ← Instance axios configurée (baseURL = API NestJS)
│   │   ├── annonces.service.ts
│   │   ├── auth.service.ts
│   │   └── stickers.service.ts
│   │
│   └── store/
│       ├── app.store.ts              ← Zustand : auth, tab actif, overlay, toast, thème
│       └── types.ts
│
├── assets/
│   ├── fonts/
│   │   └── Geist/                    ← Fichiers .ttf Geist (300, 400, 500, 600, 700)
│   └── images/
│       └── icon.png
│
└── orval.config.ts                   ← Config génération client API depuis Swagger NestJS
```

---

## 3. Design system — tokens exacts

Crée `src/design/tokens.ts` avec exactement ces valeurs (extraites de la
maquette) :

```typescript
export const colors = {
	// Brand
	green: '#1E7F43',
	greenLight: '#2A9D54',
	greenDark: '#166335',
	orange: '#F57C00',
	orangeLight: '#FF9800',
	orangeDark: '#E65100',

	// Light theme surfaces
	bg: '#F1F4F1',
	surface: '#FFFFFF',
	surface2: '#F7F9F7',
	surface3: '#EEF1EE',
	text: '#14171A',
	text2: '#565E59',
	text3: '#8A938C',
	border: 'rgba(20,23,26,0.08)',
	border2: 'rgba(20,23,26,0.14)',
	greenSoft: 'rgba(30,127,67,0.10)',
	greenSoft2: 'rgba(30,127,67,0.16)',
	orangeSoft: 'rgba(245,124,0,0.12)',
	orangeSoft2: 'rgba(245,124,0,0.18)',
	glass: 'rgba(255,255,255,0.72)',
	glassBorder: 'rgba(255,255,255,0.6)',
} as const

export const darkColors = {
	bg: '#0C100E',
	surface: '#161C18',
	surface2: '#1B221E',
	surface3: '#232B26',
	text: '#ECF0EC',
	text2: '#9AA39C',
	text3: '#69736C',
	border: 'rgba(255,255,255,0.09)',
	border2: 'rgba(255,255,255,0.16)',
	greenSoft: 'rgba(42,157,84,0.16)',
	greenSoft2: 'rgba(42,157,84,0.24)',
	orangeSoft: 'rgba(255,152,0,0.14)',
	orangeSoft2: 'rgba(255,152,0,0.22)',
	glass: 'rgba(22,28,24,0.68)',
	glassBorder: 'rgba(255,255,255,0.08)',
} as const

export const shadows = {
	sm: {
		shadowColor: '#10180C',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	md: {
		shadowColor: '#10180C',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 5,
	},
	lg: {
		shadowColor: '#10180C',
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.12,
		shadowRadius: 24,
		elevation: 10,
	},
} as const

export const radius = {
	sm: 8,
	md: 12,
	lg: 16,
	xl: 22,
	full: 999,
} as const
```

---

## 4. Composant Icon.tsx — système d'icônes custom

Crée `src/design/Icon.tsx` avec exactement ces paths (port direct de la
maquette) :

```typescript
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// Paths SVG 24px grid, single-stroke, currentColor
// Source: maquette Claude Design RetrouveCI
const ICON_PATHS: Record<string, string> = {
  home:      '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>',
  scan:      '<path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><rect x="7" y="8" width="10" height="8" rx="1.4"/>',
  list:      '<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1.2"/><circle cx="3.5" cy="12" r="1.2"/><circle cx="3.5" cy="18" r="1.2"/>',
  user:      '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  search:    '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
  qr:        '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3"/><path d="M21 14v.01"/><path d="M14 21h3"/><path d="M21 17v4"/>',
  camera:    '<path d="M4 8a2 2 0 0 1 2-2h1.5l1.2-1.8a1 1 0 0 1 .83-.45h5a1 1 0 0 1 .83.45L16.5 6H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="12.5" r="3.5"/>',
  bell:      '<path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 8-2.5 8h17S18 15 18 9Z"/><path d="M10.5 20.5a2 2 0 0 0 3 0"/>',
  pin:       '<path d="M12 21s-6.5-5.5-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.5 12 21 12 21Z"/><circle cx="12" cy="10.5" r="2.4"/>',
  close:     '<path d="M6 6 18 18"/><path d="M18 6 6 18"/>',
  plus:      '<path d="M12 5v14"/><path d="M5 12h14"/>',
  check:     '<path d="m5 12.5 4.5 4.5L19 7"/>',
  checkCircle:'<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  chevR:     '<path d="m9 5 7 7-7 7"/>',
  chevL:     '<path d="m15 5-7 7 7 7"/>',
  chevD:     '<path d="m5 9 7 7 7-7"/>',
  filter:    '<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>',
  phone:     '<path d="M6.5 3.5h4l1.5 4-2.2 1.5a12 12 0 0 0 5.2 5.2l1.5-2.2 4 1.5v4a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2Z"/>',
  lock:      '<rect x="4.5" y="10.5" width="15" height="10" rx="2.2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  eye:       '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
  eyeOff:    '<path d="M4 4 20 20"/><path d="M9.5 5.8A9.7 9.7 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.6 3.3M6.4 7.6A15.8 15.8 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 3-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  edit:      '<path d="M4 20h4l10-10-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>',
  trash:     '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
  logout:    '<path d="M15 4h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-2"/><path d="M10 12H3"/><path d="m6 8-4 4 4 4"/>',
  settings:  '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/>',
  shield:    '<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6Z"/><path d="m9 12 2 2 4-4"/>',
  share:     '<circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="6" r="2.5"/><circle cx="17" cy="18" r="2.5"/><path d="m8.3 11 6.4-3.6M8.3 13l6.4 3.6"/>',
  arrowR:    '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
  tag:       '<path d="M3.5 11.5 11 4h7v7l-7.5 7.5a2 2 0 0 1-2.8 0l-4.2-4.2a2 2 0 0 1 0-2.8Z"/><circle cx="14.5" cy="7.5" r="1.3"/>',
  package:   '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5Z"/><path d="m3.5 7.5 8.5 4.5 8.5-4.5"/><path d="M12 21v-9"/>',
  clock:     '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  send:      '<path d="m4 12 16-7-7 16-2.5-6.5L4 12Z"/>',
  flash:     '<path d="M13 3 5 13h6l-1 8 8-10h-6Z"/>',
  info:      '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.8v.2"/>',
  whatsapp:  '<path d="M4 20.5 5.5 16a8 8 0 1 1 3 3Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5 1 0 1.5-1 1.5-1.5l-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2c-.5 0-1.5.5-1.5 1.5Z"/>',
  moon:      '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  sun:       '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/>',
  refresh:   '<path d="M20 11a8 8 0 0 0-14-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14 4.5L20 16"/><path d="M20 20v-4h-4"/>',
  image:     '<rect x="3.5" y="4.5" width="17" height="15" rx="2.2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4.5 17 4.5-4.5 3 3 3.5-3.5 4 4"/>',
  calendar:  '<rect x="4" y="5.5" width="16" height="15" rx="2.2"/><path d="M4 10h16"/><path d="M8 3.5v4"/><path d="M16 3.5v4"/>',
  globe:     '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.5 2.4 3.8 5.4 3.8 8.5S14.5 18.1 12 20.5c-2.5-2.4-3.8-5.4-3.8-8.5S9.5 5.9 12 3.5Z"/>',
};

interface IconProps {
  name: keyof typeof ICON_PATHS;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Parse le SVG path string en éléments react-native-svg
function parseAndRender(pathStr: string, color: string, strokeWidth: number) {
  // Implémentation : parser les éléments <path>, <circle>, <rect>
  // et les rendre avec react-native-svg
  // Chaque <path d="..."/> → <Path d="..." />
  // Chaque <circle cx="..." cy="..." r="..."/> → <Circle ... />
  // Chaque <rect x="..." y="..." width="..." height="..." rx="..."/> → <Rect ... />
  const elements: React.ReactElement[] = [];

  // Regex pour extraire les paths
  const pathRegex = /<path d="([^"]+)"/g;
  const circleRegex = /<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g;
  const rectRegex = /<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"(?:\s+rx="([^"]+)")?/g;

  let match;
  let key = 0;

  while ((match = pathRegex.exec(pathStr)) !== null) {
    elements.push(
      <Path key={key++} d={match[1]} stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeLinejoin="round" fill="none" />
    );
  }
  while ((match = circleRegex.exec(pathStr)) !== null) {
    elements.push(
      <Circle key={key++} cx={parseFloat(match[1])} cy={parseFloat(match[2])}
        r={parseFloat(match[3])} stroke={color} strokeWidth={strokeWidth} fill="none" />
    );
  }
  while ((match = rectRegex.exec(pathStr)) !== null) {
    elements.push(
      <Rect key={key++} x={parseFloat(match[1])} y={parseFloat(match[2])}
        width={parseFloat(match[3])} height={parseFloat(match[4])}
        rx={match[5] ? parseFloat(match[5]) : 0}
        stroke={color} strokeWidth={strokeWidth} fill="none" />
    );
  }

  return elements;
}

export function Icon({ name, size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) {
  const pathStr = ICON_PATHS[name];
  if (!pathStr) return null;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {parseAndRender(pathStr, color, strokeWidth)}
    </Svg>
  );
}
```

---

## 5. Navigation — TabBar custom glassmorphic

La barre de navigation a 4 items : Accueil, Scanner, Annonces, Compte. **Le
bouton "Scanner" n'est pas un vrai tab** — il ouvre `/(modals)/scan` en modal
plein écran.

Dans `app/(tabs)/_layout.tsx` :

```typescript
// Le tab Scanner doit :
// 1. Ne jamais rendre l'écran scan comme un tab normal
// 2. Appeler router.push('/(modals)/scan') au tap
// 3. Avoir une icône orange (--orange) au lieu de verte
// 4. Avoir un fond légèrement distinct (orange-soft) au lieu de green-soft

// TabBar custom : floating, glassmorphic, borderRadius 24, blur(22px) saturate(180%)
// Position: absolute, left: 14, right: 14, bottom: 14
// Height: 66
// Chaque item: colonne (icône + label), label 10.5px, fontWeight 700 si actif 500 sinon
// Item actif: pill de fond (40×30, borderRadius 12) derrière l'icône
```

---

## 6. Écrans à implémenter (avec détails comportementaux)

### 6.1 — Onboarding (`onboarding.tsx`)

- 3 slides avec illustrations SVG maison (pin, scan, communauté)
- Dots de pagination en bas
- Bouton "Suivant" / "Commencer" sur le dernier slide
- Persisté avec `expo-secure-store` : ne plus montrer si déjà vu
- Animation de slide : `react-native-reanimated` (translateX)

### 6.2 — Home (`features/home/HomeScreen.tsx`)

- Header : "Bonjour [Prénom] 👋" si connecté / "Bienvenue sur RetrouveCI" sinon
- Bell avec badge si notifications non lues → ouvre `NotificationsSheet`
- Avatar utilisateur cliquable → navigue vers compte
- Barre de recherche (tappable → navigue vers Annonces avec focus)
- **CTA primaire orange** : grande card "Scanner un sticker" → ouvre modal scan
- **CTA secondaire** : "Déclarer un objet perdu" → (si connecté) form, sinon →
  modal auth
- Stats pills horizontaux : objets rendus + stickers actifs
- Carrousel horizontal d'annonces récentes (5 items, `AnnonceCardH`)
- `NotificationsSheet` : liste filtrée (Tous / Scans / Alertes / Système)

### 6.3 — Listings (`features/listings/ListingsScreen.tsx`)

- SearchBar avec focus auto si `focusSearch` param
- Chip filters horizontaux (Tous / Perdus / Retrouvés)
- `FiltersSheet` : Ville (Selector + OptionPicker), Commune, Période, Catégorie
- Liste `AnnonceRow` (image thumb + statut badge + titre + localisation)
- Badge résultats filtrés
- `AnnonceDetail` : bottom sheet avec tous les détails + bouton contact WhatsApp

Villes disponibles (données mock à remplacer par API) :
`['Abidjan', 'Bouaké', 'Yamoussoukro', 'San-Pédro', 'Korhogo', 'Daloa', 'Man', 'Gagnoa', 'Abengourou', 'Divo']`

Communes Abidjan :
`['Cocody', 'Yopougon', 'Marcory', 'Treichville', 'Plateau', 'Adjamé', 'Abobo', 'Koumassi', 'Port-Bouët', 'Attécoubé', 'Bingerville', 'Anyama']`

### 6.4 — Scan (`features/scan/ScanFlow.tsx`)

Flow en 2 phases : `scanning` → `result`

**Phase scanning :**

- Plein écran, fond noir, flux caméra (`expo-camera` + `BarcodeScanner`)
- Overlay : coins de visée animés, label "Placez le QR code dans le cadre"
- Bouton fermer (haut gauche), torch toggle (haut droite)

**Phase result — 3 cas possibles :**

1. **`registered`** : sticker connu et annoncé perdu → affiche fiche objet +
   "Contacter le propriétaire" (WhatsApp) + "Signaler comme retrouvé"
2. **`unregistered` + connecté** : sticker vierge → formulaire de nomination
   (nom de l'objet + photo) → confirmation d'activation → toast "Sticker activé
   : [nom]"
3. **`unregistered` + non connecté** : invite à créer un compte → ouvre modal
   auth en mode `register`

### 6.5 — Auth (`features/auth/AuthScreen.tsx`)

Views : `login` → `otp` → `register` → `forgot` → `forgotSent`

- `login` : champ téléphone (+225 prefix), bouton "Recevoir le code", lien
  "Créer un compte", lien "Mot de passe oublié"
- `otp` : `OtpInput` (4 cases carrées, autofocus, auto-submit à 4 chiffres),
  countdown "Renvoyer dans 0:28"
- `register` : nom complet + téléphone + mot de passe (toggle visibilité)
- `forgot` : téléphone → `forgotSent` : confirmation SMS
- Chaque view : animation d'entrée (translateY + opacity,
  cubic-bezier(0.22,1,0.36,1))
- Fond : `MeshBg` (dégradé doux multi-couches vert/orange)

### 6.6 — Account (`features/account/AccountScreen.tsx`)

3 sections via `SectionTabs` : **Annonces / Stickers / Commandes**

- **Annonces** : `MyAnnonceCard` avec actions (Résoudre / Modifier / Supprimer
  via `ConfirmDialog`)
- **Stickers** : `StickerCard` avec bouton "Activer" → ouvre modal scan en mode
  activation, "Partager" → `ShareSheet`
- **Commandes** : `CommandeCard` (statut, date, montant, pack)
- Bloc paramètres en bas : thème (Clair/Sombre/Auto), lien profil, déconnexion
- Section paramètres : `SettingRow` avec `Toggle` pour thème

### 6.7 — Order (`features/order/OrderFlow.tsx`)

4 étapes avec `OrderStepper` : **Pack → Livraison → Paiement → Confirmé**

**Étape 1 — Pack :**

```typescript
const PACKS = [
	{
		id: 'starter',
		nom: 'Starter',
		prix: 1500,
		qte: 4,
		features: ['4 stickers QR uniques', 'Support WhatsApp'],
	},
	{
		id: 'famille',
		nom: 'Famille',
		prix: 2500,
		qte: 8,
		popular: true,
		features: [
			'8 stickers QR uniques',
			'Support prioritaire',
			'Économisez 500 FCFA',
		],
	},
	{
		id: 'pro',
		nom: 'Pro',
		prix: 7000,
		qte: 20,
		features: [
			'20 stickers QR uniques',
			'Support dédié',
			'Économisez 3000 FCFA',
		],
	},
]
```

**Étape 2 — Livraison :** adresse (commune Abidjan) + nom destinataire +
téléphone. Frais livraison : `1 000 FCFA` (ou offerte si code promo
`RETROUVECI`).

**Étape 3 — Paiement :**

```typescript
const MOYENS_PAIEMENT = [
	{ id: 'orange', label: 'Orange Money', color: '#FF6B00' },
	{ id: 'mtn', label: 'MTN MoMo', color: '#FFCC00' },
	{ id: 'moov', label: 'Moov Money', color: '#1A57C4' },
	{ id: 'wave', label: 'Wave', color: '#1DC4F2' },
]
// → expo-web-browser.openAuthSessionAsync(checkoutUrl) pour redirection paiement
```

**Étape 4 — Confirmé :** animation check vert, récapitulatif commande, boutons
"Voir mes stickers" + "Retour à l'accueil".

Format prix : `(n: number) => \`${n.toLocaleString('fr-FR')} FCFA\``

---

## 7. Store Zustand (`store/app.store.ts`)

```typescript
interface AppState {
	// Auth
	isAuthenticated: boolean
	user: User | null
	token: string | null

	// Navigation state
	activeTab: 'accueil' | 'annonces' | 'compte'
	activeOverlay: 'scan' | 'auth' | 'order' | null

	// UI
	theme: 'light' | 'dark' | 'auto'
	toast: { message: string; icon?: string } | null

	// Compte
	accountSection: 'annonces' | 'stickers' | 'commandes'

	// Actions
	setAuth: (user: User, token: string) => void
	logout: () => void
	setTheme: (theme: AppState['theme']) => void
	showToast: (message: string, icon?: string) => void
	setOverlay: (overlay: AppState['activeOverlay']) => void
}
```

Persistance via `expo-secure-store` : token d'auth uniquement.

---

## 8. Intégration API NestJS

### Client API (`services/api.client.ts`)

```typescript
// baseURL : variable d'environnement EXPO_PUBLIC_API_URL
// Intercepteur : injecte le token depuis expo-secure-store sur chaque requête
// Gestion 401 : clear token + redirect auth
```

### Config Orval (`orval.config.ts`)

```typescript
export default {
	retrouveci: {
		input: {
			target: process.env.API_URL + '/api-json', // Swagger NestJS endpoint
		},
		output: {
			mode: 'tags-split',
			target: 'src/services/generated/',
			client: 'react-query',
			override: {
				mutator: { path: 'src/services/api.client.ts', name: 'apiClient' },
			},
		},
	},
}
```

**Si le Swagger n'est pas encore accessible**, crée les services manuellement
pour ces endpoints prioritaires :

- `GET  /annonces` + `GET /annonces/:id`
- `POST /annonces` (déclarer perdu)
- `GET  /stickers/:code` (scan QR → lookup)
- `POST /stickers/:code/activate`
- `POST /auth/send-otp` + `POST /auth/verify-otp`
- `GET  /me` + `PATCH /me`
- `GET  /commandes` + `POST /commandes`
- `GET  /notifications`

---

## 9. Configuration Turborepo

Dans `turbo.json` (root), ajoute le pipeline mobile :

```json
{
	"pipeline": {
		"mobile#build": {
			"dependsOn": ["api#build"],
			"outputs": [".expo/**"]
		},
		"mobile#start": {
			"cache": false,
			"persistent": true
		},
		"mobile#lint": {},
		"mobile#test": {}
	}
}
```

Dans `package.json` root, ajoute les scripts :

```json
{
	"scripts": {
		"mobile": "turbo run start --filter=mobile",
		"mobile:build:android": "turbo run build:android --filter=mobile",
		"mobile:build:ios": "turbo run build:ios --filter=mobile"
	}
}
```

Dans `apps/mobile/package.json` :

```json
{
	"name": "mobile",
	"scripts": {
		"start": "expo start",
		"android": "expo run:android",
		"ios": "expo run:ios",
		"build:android": "eas build --platform android",
		"build:ios": "eas build --platform ios",
		"lint": "eslint src app --ext .ts,.tsx",
		"test": "jest"
	}
}
```

---

## 10. Tailwind config avec tokens de la maquette

```typescript
// apps/mobile/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
	content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
	presets: [require('nativewind/preset')],
	theme: {
		extend: {
			colors: {
				green: {
					DEFAULT: '#1E7F43',
					light: '#2A9D54',
					dark: '#166335',
					soft: 'rgba(30,127,67,0.10)',
					soft2: 'rgba(30,127,67,0.16)',
				},
				orange: {
					DEFAULT: '#F57C00',
					light: '#FF9800',
					dark: '#E65100',
					soft: 'rgba(245,124,0,0.12)',
					soft2: 'rgba(245,124,0,0.18)',
				},
				bg: { DEFAULT: '#F1F4F1', dark: '#0C100E' },
				surface: {
					DEFAULT: '#FFFFFF',
					'2': '#F7F9F7',
					'3': '#EEF1EE',
					dark: '#161C18',
					d2: '#1B221E',
					d3: '#232B26',
				},
				text: {
					DEFAULT: '#14171A',
					'2': '#565E59',
					'3': '#8A938C',
					dark: '#ECF0EC',
					d2: '#9AA39C',
					d3: '#69736C',
				},
			},
			borderRadius: {
				'2xl': '16px',
				'3xl': '22px',
			},
			fontFamily: {
				sans: ['Geist', 'System'],
			},
		},
	},
	plugins: [],
} satisfies Config
```

---

## 11. Ordre d'exécution recommandé

1. **Workspace** : Créer `apps/mobile/`, configurer `package.json`, `turbo.json`
2. **Foundation** : `app.json`, `babel.config.js`, `metro.config.js`,
   `tsconfig.json`
3. **Design system** : `tokens.ts`, `Icon.tsx`, fonts Geist,
   `tailwind.config.ts`
4. **Components primitifs** : `Btn`, `Card`, `Sheet`, `Field`, `Avatar`,
   `Toast`, `MeshBg`
5. **Navigation** : `app/_layout.tsx` + `app/(tabs)/_layout.tsx` avec TabBar
   custom
6. **Écrans dans l'ordre** : Onboarding → Home → Listings → Scan → Auth →
   Account → Order
7. **Store** : Zustand + persistance `expo-secure-store`
8. **Services API** : client axios + hooks TanStack Query
9. **Tests** : Jest + RNTL sur composants critiques
10. **EAS** : `eas.json` + configuration build preview/production

---

## 12. Contraintes importantes

- **Aucun appel API directement dans les composants** — toujours via un hook
  dans `services/`
- **Aucune logique métier dans les écrans** (`app/`) — déléguer aux composants
  `features/`
- **Le thème** (clair/sombre/auto) doit être géré via le store Zustand +
  `useColorScheme` de RN
- **Le token d'auth** ne doit jamais être dans le state React — uniquement dans
  `expo-secure-store`
- **Toutes les Bottom Sheets** utilisent `@gorhom/bottom-sheet` (pas des modals
  RN natifs)
- **Les icônes** viennent exclusivement de `Icon.tsx` custom (pas de lucide, pas
  d'expo icons)
- **La police Geist** doit être chargée avec `expo-font` avant d'afficher quoi
  que ce soit (SplashScreen guard dans `app/_layout.tsx`)
- **Format des prix** : toujours `n.toLocaleString('fr-FR') + ' FCFA'`
- **Langue** : toute l'interface est en français ivoirien
- **Données mock** : utiliser des données cohérentes avec le marché ivoirien
  (noms, communes, téléphones +225)

---

## Référence design

Le design de référence est accessible ici (nécessite une session claude.ai
connectée) :
`https://claude.ai/design/p/53f4ce9a-a1b7-42e3-939a-c0800a31820c?file=index.html&via=share`

Les specs exactes extraites de ce design (tokens CSS, ICON_PATHS, composants,
comportements) sont entièrement encodées dans ce prompt — tu n'as pas besoin
d'accéder à l'URL pour implémenter.
