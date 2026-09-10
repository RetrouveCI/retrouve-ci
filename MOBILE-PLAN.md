# Plan de construction — application mobile RetrouveCI (Expo)

> Objectif : ajouter `apps/mobile`, une application Expo (React Native) qui
> reproduit la maquette Claude Design et consomme **la même API NestJS** que
> `apps/client` et `apps/admin`.
>
> Source de vérité du dessin : le projet Claude Design
> `53f4ce9a-a1b7-42e3-939a-c0800a31820c` — onze fichiers, lus et archivés (§10).
> Source de vérité du **comportement** : `@app/contracts` et les contrôleurs de
> `apps/api`. Quand les deux divergent, **le contrat gagne** et la §4 dit
> pourquoi.
>
> Ce document est **normatif** au même titre que `REFONTE-PLAN.md` l'a été pour
> la refonte du client : chaque PR d'étape est relue contre la §2 et la §4.

---

## 0. État des lieux

`apps/mobile` **n'existe pas** dans ce dépôt. Un portage a existé en juin 2026
sur une branche `mobile-app`, retiré à la demande de l'utilisateur pour des
raisons de **réseau** (tunnel Expo inutilisable derrière le DNS d'entreprise,
build EAS bloqué par le hoisting pnpm) et non de code. Recompté le 2026-09-10 :

- `origin` n'a qu'une branche, `main` ;
- des quatre commits de ce chantier, **un seul survit** dans le magasin d'objets
  local, `af5bfa1` (le scaffold), et il est **dangling** — aucune ref ne
  l'atteint, un `git gc` l'emporte ;
- ce qu'il porte et qui vaut d'être sauvé : `code-prompt-expo-retrouveci`, 792
  lignes de spec du prototype. **Source secondaire** : écrite avant le portage,
  elle suppose le SDK 52 et décrit un accueil (bandeau de statistiques, «
  Comment ça marche ») que **la maquette actuelle ne contient plus**. Elle sert
  de recoupement, jamais de référence.

Le chantier repart donc de zéro, avec l'expérience de juin consignée en §3.

---

## 1. Méthode de travail (contraignante)

Le chantier est **incrémental**. Chaque étape `M<n>` du tableau §5 suit
exactement ce cycle :

1. **Branche dédiée** depuis `mobile` : `git switch -c mobile-m<n>-<slug>`.
   > `mobile` est la **branche d'intégration** : toutes les PR d'étape y sont
   > mergées, puis une PR finale `mobile` → `main` clôt le chantier. Le tiret
   > (et non le slash) est imposé par git : une ref `mobile` et une ref
   > `mobile/m1-…` ne peuvent pas coexister.
2. **Travail + vérification locale** :
   ```bash
   pnpm run typecheck && pnpm run lint --force && pnpm run test --force && pnpm run format:check
   pnpm --filter @app/mobile test          # jest-expo
   pnpm --filter @app/mobile exec expo export --platform android
   ```
   > `--force` sur `lint` et `test` : sans lui, Turbo répond « cached » et
   > n'exécute rien. ⚠️ **`expo export` est la seule vérification de bundle qui
   > fasse foi** — un serveur Metro laissé ouvert sert un bundle en cache et le
   > `grep` sur sa sortie ment (mesuré en juin).
3. **Demander la permission avant de committer.** L'agent ne lance jamais
   `git commit` de sa propre initiative, et committe par pathspec
   (`git commit -- <chemins>`), jamais l'index entier.
4. **Pull request via `gh`** (`gh pr create --base mobile`), description au
   format **What / Why / How / Testing** d'`AGENTS.md`, en anglais. Reviewer
   `JowellDev`, assignés `JowellDev` + `JoelDigbeu`, un label _kind_ et un label
   _semver_.
5. **Message de passation** en fin d'étape : un texte autonome (branche de
   départ, ce qui vient d'être fait, ce qui reste, fichiers concernés, commandes
   de vérification) que l'utilisateur colle pour démarrer la session suivante.

> ⚠️ **Une étape = une session.** Ne jamais enchaîner deux étapes dans la même
> session : le message de passation existe précisément pour repartir d'un
> contexte propre.

### 1.1 Mesurer avant d'appliquer

Ce document chiffre ce qu'il a compté (11 fichiers de maquette, 3 packs, 9
catégories, 6 chiffres d'OTP, 5 écarts bloquants). Avant d'appliquer une
prescription, **recompter** : si l'écart est significatif, corriger ce document
dans la PR de l'étape plutôt que de laisser diverger le plan et le code.

### 1.2 Ce qui n'est pas négociable

- **Les identifiants sont en anglais** — composants, champs, variables — même
  quand le texte affiché est en français. La maquette nomme ses données en
  français (`statut`, `titre`, `ville`, `auteur`) ; le portage les traduit
  (`status`, `title`, `city`, `author`) **sauf** là où le contrat impose déjà le
  français (`ville`, `commune` dans `lost-items` — voir §4, écart 21).
- **Désactiver ≠ supprimer.** Une fonctionnalité de la maquette qui n'a pas
  d'API derrière est **commentée avec un marqueur de raison**, jamais effacée —
  comme `apps/client` a garé son `payment-step.tsx`.
- **Aucun composant ne parle à l'API.** Les appels vivent dans `src/services/`,
  exposés par des hooks TanStack Query. C'est la transposition native de la
  règle `servers/*.loader.ts` du client.

---

## 2. Invariants d'interface et de flux

> **C'est la section qui protège le chantier.** Vingt PR écrites sur plusieurs
> semaines produisent vingt dialectes si rien ne les tient.

### 2.1 Jetons de dessin

Repris **au caractère près** de l'`index.html` de la maquette. Aucune étape
n'invente une couleur.

| Rôle                                      | Clair                                         | Sombre                                         |
| ----------------------------------------- | --------------------------------------------- | ---------------------------------------------- |
| `green` / `green-light` / `green-dark`    | `#1E7F43` / `#2A9D54` / `#166335`             | identiques                                     |
| `orange` / `orange-light` / `orange-dark` | `#F57C00` / `#FF9800` / `#E65100`             | identiques                                     |
| `bg`                                      | `#F1F4F1`                                     | `#0C100E`                                      |
| `surface` / `surface-2` / `surface-3`     | `#FFFFFF` / `#F7F9F7` / `#EEF1EE`             | `#161C18` / `#1B221E` / `#232B26`              |
| `text` / `text-2` / `text-3`              | `#14171A` / `#565E59` / `#8A938C`             | `#ECF0EC` / `#9AA39C` / `#69736C`              |
| `border` / `border-2`                     | `rgba(20,23,26,.08)` / `.14`                  | `rgba(255,255,255,.09)` / `.16`                |
| `green-soft` / `orange-soft`              | `rgba(30,127,67,.10)` / `rgba(245,124,0,.12)` | `rgba(42,157,84,.16)` / `rgba(255,152,0,.14)`  |
| `glass` / `glass-border`                  | `rgba(255,255,255,.72)` / `.6`                | `rgba(22,28,24,.68)` / `rgba(255,255,255,.08)` |

Rayon de base **16**. Police **Geist** (400/500/600/700) et **Geist Mono** pour
les codes de sticker, les références de commande et les libellés en capitales
espacées.

⚠️ **Le thème est un état applicatif, pas une variante Tailwind.** La maquette
bascule `data-theme` sur la racine ; en natif, on lit une palette par
`usePalette()` adossée au store, avec trois modes **Clair / Sombre / Auto**
(`Auto` suit `Appearance`). Le mode retenu en juin, et reconduit : jetons de
`StyleSheet`, pas de variantes `dark:`.

### 2.2 Vocabulaire d'interface

Un même rôle, une même forme. Posé par M2/M3 ; aucune étape ultérieure n'en
invente d'autres.

| Rôle                                    | Forme imposée                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| Action primaire                         | `Btn variant="primary"` — aplat `green`, texte blanc, **56 px** (`lg`)                      |
| Action « objet perdu » / promotionnelle | `variant="accent"` — aplat `orange`, texte blanc                                            |
| Action secondaire                       | `variant="outline"` (contour 1,5 px) ou `"ghost"` (aplat `surface-3`)                       |
| Action destructrice                     | `ghost` + encre `orange-dark`, **toujours** derrière un `ConfirmDialog`                     |
| Bouton-icône                            | `IconBtn` **44 px** — la zone de tap, jamais le dessin                                      |
| Champ de saisie                         | `Field` — **54 px**, police **16 px** (sous 16, iOS zoome au focus)                         |
| Carte                                   | `Card` — rayon 16, bordure 1 px `border`, ombre `shadow-sm`                                 |
| Pastille d'état                         | `StatusBadge` — capsule + point de couleur, 12,5 px                                         |
| Puce de filtre                          | `Chip` 38 px ; actif = fond `green`, texte blanc                                            |
| Onglet de section                       | `SectionTabs` 40 px ; actif = fond `text`, texte `bg`                                       |
| **Feuille inférieure**                  | `Sheet` — filtres, sélecteurs, édition, partage. Rayon 26 en haut, poignée 40×5             |
| **Dialogue centré**                     | `ConfirmDialog` — et **seulement** pour une confirmation                                    |
| **Barre d'onglets**                     | `TabBar` flottante en verre, 4 entrées, 66 px, à 14 px des bords                            |
| Défilement horizontal                   | `HScroll` — listes secondaires (annonces récentes, filtres, onglets). **Jamais** une action |

**Ce qui n'existe pas** : de tiroir latéral, de bulle flottante permanente, de
cible tactile sous 44 px, et **aucune quatrième variante de bouton** en dehors
des huit que `ui.jsx` déclare (`primary`, `accent`, `dark`, `outline`, `ghost`,
`soft`, `softAccent`, `glass`).

### 2.3 La barre d'onglets, et son piège

Quatre entrées : **Accueil · Scanner · Annonces · Compte**. ⚠️ **« Scanner »
n'est pas un onglet** — c'est un bouton qui pousse une modale plein écran
(`app/(modals)/scan`), parce qu'un viseur caméra ne peut pas cohabiter avec une
barre flottante. Sa couleur est `orange` là où les trois autres sont `green` :
c'est le seul endroit de l'app où l'orange marque une **navigation** et non une
action perdue.

### 2.4 Les cinq flux de bout en bout

Chaque étape déclare le ou les flux qu'elle touche. Avant de merger, dérouler le
flux **entier** sur un appareil, pas seulement l'écran modifié.

#### Flux A — « J'ai perdu un objet »

```
Accueil → « Faire une annonce » → Publier 1/3 → 2/3 → 3/3
        → Compte · Mes annonces (état de modération !) → Détail → Contact
```

Étapes : M7, M13, M12, M9. Invariant : la même annonce porte le **même titre, la
même pastille de type et le même couple lieu/date** sur les cinq écrans où elle
apparaît. ⚠️ Et elle porte **son état de modération** partout où son
propriétaire la voit (§4, écart 9).

#### Flux B — « J'ai trouvé un objet »

```
(a) Sans l'app : appareil photo du téléphone → /q/:code (le web, pas nous)
(b) Avec l'app : onglet Scanner → résultat → Contacter / Prévenir
(c) Sans sticker : Accueil → « Faire une annonce » → type « trouvé »
```

Étapes : M10, M9, M13. Invariant : le scan **ne crée pas** une variante de la
page de contact — il en reproduit les deux canaux et **les mêmes garde-fous**
(§4, écart 26).

#### Flux C — « J'active mon sticker »

```
Compte · Mes stickers → « Activer un sticker » → Scanner → sticker `generated`
        → nommer l'objet + choisir le contact direct → Actif
```

Étapes : M11, M14, M10. Invariant : un sticker `generated` **n'a pas de
propriétaire** — il n'apparaît donc dans aucune liste tant qu'il n'est pas
activé, et c'est `GET /qr-codes/mine/summary` qui en compte les livrés en
attente.

#### Flux D — « Je commande des stickers »

```
Accueil « Commander un sticker » (source=home)  ┐
Compte · Mes commandes « Commander » (=account) ┘ → Pack → Livraison → Confirmé
        → Compte · Mes commandes (suivi de statut)
```

Étapes : M15. Invariant : **le prix et les frais ne sont jamais calculés par
l'app**. Le catalogue vient de `@app/contracts/sticker-orders`, le total de la
réponse de l'API. Le paiement est **à la livraison** (§4, écart 4).

#### Flux E — « Je me connecte »

```
Écran gardé → Auth (téléphone) → OTP 6 chiffres → session
        → (inscription) nom + mot de passe → compte
```

Étapes : M17, M5. Invariant : **6 chiffres partout**, `OTP_TTL_SECONDS` = 300,
`OTP_RESEND_DELAY_SECONDS` = 30 — lus dans `@app/contracts/shared`, jamais
réécrits (§4, écart 1).

### 2.5 Règles de cohérence à vérifier à chaque PR

1. Aucune couleur ni taille en dur hors du fichier de jetons.
2. Aucune cible tactile sous 44 px.
3. Aucun appel réseau hors de `src/services/`.
4. Aucune constante métier recopiée : prix, catégories, longueurs, motifs de
   modération et libellés viennent de `@app/contracts`.
5. Tout écran qui liste possède ses trois états : **chargement** (`Skeleton`),
   **vide** (`EmptyState`), **erreur** (rejouable).
6. Tout écrit possède son retour : `Toast` en succès, message de champ en échec.
7. Le mode sombre est vérifié sur **chaque** écran livré, pas à la fin.

---

## 3. Décisions déjà prises

### 3.1 Pile technique — reprise de juin, **versions recomptées le 2026-09-10**

| Brique         | Juin 2026          | Retenu                 | Pourquoi                                    |
| -------------- | ------------------ | ---------------------- | ------------------------------------------- |
| `expo`         | SDK 56             | **57.0.21** (`latest`) | 56 est maintenu mais n-1 ; 58 est en canary |
| `expo-router`  | 56.x               | **57.0.20**            | suit le SDK                                 |
| `react-native` | 0.85               | **0.87.1**             | suit le SDK                                 |
| `nativewind`   | 4.2.5              | **4.2.6**              | v5 toujours en `preview.4`                  |
| `tailwindcss`  | 3.4.19 (épinglé)   | **3.x épinglé**        | ⚠️ NativeWind 4 **exige** Tailwind 3        |
| État           | Zustand            | Zustand                |                                             |
| Données        | TanStack Query     | TanStack Query         |                                             |
| Tests          | Jest + `jest-expo` | Jest + `jest-expo`     | Vitest ne sait pas monter RN                |

⚠️ **Le verrou Tailwind est structurel, pas une dette de juin.** Le monorepo est
en Tailwind **4** (`packages/ui`), `apps/mobile` sera en Tailwind **3**. Deux
conséquences, mesurées en juin et toujours d'actualité :

- le `prettier-plugin-tailwindcss` de la racine (v4) **plante** sur l'app mobile
  → `.prettierrc.json` local à `apps/mobile`, sans le plugin ;
- `apps/mobile` n'importe **jamais** `@app/ui`. Le paquet est écrit pour le DOM
  et pour Tailwind 4 ; il n'y a pas de composant partagé entre le web et le
  natif, et il ne faut pas essayer d'en fabriquer.

### 3.2 Ce qui est partagé, et ce qui ne l'est pas

| Paquet                   | Partagé avec le mobile ?                                                |
| ------------------------ | ----------------------------------------------------------------------- |
| `@app/contracts`         | **Oui** — c'est le point du chantier (§6, M6)                           |
| `@app/ui`                | **Non** — DOM + Tailwind 4                                              |
| `@app/web-kit`           | **Non** — `ActionResult`, `useActionFetcher` : formulaires React Router |
| `@app/auth`              | **Non** — serveur uniquement                                            |
| `@app/database`          | **Non**                                                                 |
| `@app/typescript-config` | **Non** — Expo impose son propre `tsconfig.base`                        |
| `@app/eslint-config`     | **Partiellement** — un préréglage `expo` à ajouter, ou config locale    |

### 3.3 Pièges déjà payés en juin — à ne pas repayer

- Le greffon `react-native-worklets` doit être **le dernier** de
  `babel.config.js`.
- Jest a besoin d'un `transformIgnorePatterns` conscient de pnpm :
  `node_modules/.pnpm/(?!(...))`.
- RNTL v14 : `render` est **asynchrone** (`await render(...)`), pas de requête
  `UNSAFE_*`.
- EAS + pnpm : le greffon Babel de NativeWind réécrit `jsxImportSource` vers
  `react-native-css-interop`, que pnpm n'expose pas → l'ajouter en **dépendance
  directe**, version accordée à NativeWind.
- Ajouter un fichier de route laisse `.expo/types/router.d.ts` périmé : `tsc`
  rougit sur le nouveau `href` jusqu'à ce qu'Expo régénère (un `expo start`
  bref, ou `expo export`).
- `react-native-svg` sur Android : deux dégradés qui partagent un `id` se
  télescopent → `useId()` pour chaque identifiant de `<defs>`.
- Pas d'`Intl` fiable sous Hermes → un `formatPrice` local **qui délègue à
  `@app/contracts/sticker-orders`** pour la règle, et ne réinvente pas le
  séparateur (espace fine insécable).

### 3.4 Réseau et appareil — la contrainte qui a tué juin

Le tunnel Expo **ne fonctionne pas** sur le poste : le DNS d'entreprise ne
résout pas `exp.direct`. Deux voies :

1. **LAN** — `.wslconfig` en `networkingMode=mirrored`, `wsl --shutdown`,
   pare-feu ouvert sur TCP 8081, téléphone sur le même Wi-Fi ;
2. **APK autonome via EAS** (`eas.json`, profil `preview`, APK interne) — ne
   demande aucun réseau pour être exécuté.

⚠️ **Cette contrainte est un risque de projet, pas un détail.** M1 ne se termine
pas tant qu'**au moins une** des deux voies n'a pas fait tourner l'app sur un
appareil réel. Sans cela, dix étapes s'empilent sans jamais être vues.

---

## 4. Écarts entre la maquette et le réel — **la section à lire avant de coder**

La maquette est un prototype : elle invente ses données et, sur cinq points,
promet ce que l'API ne fait pas. Chaque écart est tranché ici. Le numéro est
cité dans les étapes de la §6.

### 4.1 Écarts **bloquants** (la maquette est fausse, l'app ne doit pas la suivre)

| #     | Maquette                                                                                                  | Réel                                                                                                                            | Décision                                                                                                                                                                                                                                                                                                               |
| ----- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1** | OTP à **4 chiffres** à la connexion (`auth.jsx`), à **6** au changement de numéro (`account.jsx`)         | `OTP_LENGTH = 6`, jamais surchargé côté API                                                                                     | **6 partout.** Lire `OTP_LENGTH`, `OTP_TTL_SECONDS` (300), `OTP_RESEND_DELAY_SECONDS` (30) et `OTP_ERROR_MESSAGE`. La maquette se contredit elle-même : ce n'est pas un choix, c'est un bug de prototype                                                                                                               |
| **2** | Code de sticker `RC-7K2-9XQ`, et la carte « Comment le reconnaître ? » annonce le format **`RC-XXX-XXX`** | `QR_CODE_PREFIX = 'RCI'` + 6 caractères d'un alphabet sans I, O, 0 ni 1 → **`RCI-XXXXXX`**                                      | **`RCI-XXXXXX`.** Un écran qui apprend au public un mauvais format est pire qu'un écran absent : il fait rejeter des stickers valides                                                                                                                                                                                  |
| **3** | Packs **1 500 / 4**, **2 500 / 8**, **7 000 / 20**                                                        | `STICKER_PACKS_BY_ID` : `pack-4` **2 000**, `pack-8` **3 500**, `pack-20` 7 000                                                 | **Le contrat gagne.** Deux prix sur trois diffèrent ; l'app affiche le catalogue importé et n'écrit aucun nombre                                                                                                                                                                                                       |
| **4** | Étape 3 « Paiement mobile » : Orange Money, MTN MoMo, Moov, Wave, puis « Payer 3 500 FCFA »               | `createStickerOrderSchema` n'accepte **aucun** champ de paiement ; `CreateStickerOrderUseCase` estampille `PAYMENT_ON_DELIVERY` | **Tunnel à 3 étapes** : Pack → Livraison → Confirmé. L'action finale devient « Confirmer la commande », et la confirmation nomme `PAYMENT_ON_DELIVERY_LABEL` et **la somme à préparer pour le coursier**. Le catalogue mobile-money est **commenté** avec un marqueur de raison, comme le `payment-step.tsx` du client |
| **5** | Code promo `RETROUVECI` validé **dans le navigateur**, frais mis à 0 localement                           | `FREE_DELIVERY_COUPONS` = `RETROUVECI`, `LIVRAISON0`, `WELCOME2025` ; le use-case calcule le total                              | **L'app ne décide jamais du total.** Le champ poste `couponCode` ; le récapitulatif final affiche ce que l'API a répondu. Un aperçu local est toléré, jamais présenté comme acquis                                                                                                                                     |

### 4.2 Écarts de **modèle** (la maquette simplifie, le contrat structure)

| #      | Sujet                                                                                                                                                                                                                                              | Décision                                                                                                                                                                                                                                                                                                                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **6**  | La maquette a **5 catégories** (`Papiers`, `Clés`, `Électronique`, `Bagages`, `Divers`) et un `tone` `doc\|key\|phone\|bag` ; le contrat en a **9** (`phone`, `keys`, `wallet`, `bag`, `electronics`, `clothing`, `jewelry`, `documents`, `other`) | Une table `Record<LostItemCategory, { label: string; tone: ObjectTone }>` — **exhaustive par le type**, comme `OBJECT_TYPES` du client. Une catégorie ajoutée au contrat devient une erreur de compilation, pas un libellé manquant                                                                                             |
| **7**  | `statut: 'perdu' \| 'retrouve'` mélange le **type** et la **résolution**                                                                                                                                                                           | Trois axes distincts : `type` (`lost\|found`) → la pastille ; `resolutionStatus` (`active\|resolved\|expired`) → le bandeau « Résolu » ; `moderationStatus` (`pending\|published\|hidden`) → écart 9. `MyAnnonceCard` porte déjà `statut` **et** `etat` : le mappage est direct                                                 |
| **8**  | `NOTIF` : cinq types inventés (`scan`, `match`, `order`, `resolved`, `info`)                                                                                                                                                                       | Les **huit** types d'audience `user` : `qr_scan`, `match_found`, `stickers_delivered`, `listing_moderated`, `listing_contacted`, `order_processing`, `order_shipped`, `order_cancelled`. ⚠️ **`resolved` et `info` n'existent pas** — le filtre « Annonces » regroupe `match_found` + `listing_moderated` + `listing_contacted` |
| **21** | Champs français dans le contrat                                                                                                                                                                                                                    | `lost-items` expose `ville` / `commune` (français, historique), alors que le profil better-auth expose `city` / `commune`. **Ne pas uniformiser** : chaque appel utilise le nom que son contrat porte, et un mappeur fait la jointure                                                                                           |

### 4.3 Écarts de **complétude** (la maquette ne montre pas ce qui existe)

| #      | Sujet                                                                                                              | Décision                                                                                                                                                                                                                                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **9**  | ⚠️ **La modération est invisible dans la maquette.** Une annonce naît `pending` ; rien dans le prototype ne le dit | `MyAnnonceCard` **doit** porter l'état de modération et, si `hidden`, la **phrase** du motif — importée de `@app/contracts/lost-items/moderation-reason`, la même que le propriétaire lit dans la notification `listing_moderated`. C'est l'adaptation la plus importante du plan : une chaîne de modération bloquante **et muette** a déjà coûté cher en production |
| **10** | La publication est **une feuille** (photo, statut, titre, description, catégorie, ville, commune)                  | Le contrat exige en plus `eventDate`, `contactName`, `contactWhatsapp`, et des champs de pièce quand la catégorie vaut `documents`. Une feuille ne les porte pas → **tunnel à 3 étapes** aligné sur celui du client (Objet → Lieu/date → Contact)                                                                                                                    |
| **11** | La photo est une `dataURL` gardée en mémoire                                                                       | `POST /uploads/lost-item-photo` d'abord, puis publier les URL rendues. `MAX_PHOTOS` = 5, 5 Mo par photo, Cloudinary borne à 2 000 px en entrée                                                                                                                                                                                                                       |
| **12** | Le détail d'annonce a « WhatsApp » et « Contacter » qui ne font rien                                               | `POST /lost-items/:id/contact` **enregistre** le contact (et déclenche `listing_contacted`), **puis** `Linking.openURL`. L'ordre est l'invariant : le saut ne doit jamais précéder l'enregistrement                                                                                                                                                                  |
| **26** | Le résultat « sticker reconnu » n'offre qu'un bouton « Contacter le propriétaire »                                 | Deux canaux, comme `/q/:code` : `POST /:code/contact` (message écrit, toujours disponible) et `POST /:code/reach` (appel ou WhatsApp) — ⚠️ **`reach` n'est proposé que si `directContact` est vrai** sur le jeton. Sinon le bouton n'existe pas                                                                                                                      |
| **27** | Quatre issues de scan : reconnu / non activé / inconnu / non connecté                                              | `QR_TOKEN_STATUSES` en a **trois** : `generated`, `activated`, `revoked`. Il manque donc un écran **`revoked`** (« ce sticker a été désactivé par son propriétaire »), plus le 404 « code inconnu »                                                                                                                                                                  |
| **28** | L'activation ne demande que « Nom de l'objet »                                                                     | `qrTokenDetailsSchema` = `label`, `linkedObject` (≤ 120), `directContact`. « Nom de l'objet » → `linkedObject`. ⚠️ La maquette **promet** « sans voir votre numéro » : c'est exactement `directContact: false`. Le défaut est donc `false`, et le choix devient **explicite** à l'activation                                                                         |

### 4.4 Écarts **sans API** — à garer, pas à inventer

| #      | Élément de la maquette                  | État                                                                                                                                                                                                                                                                                  |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **13** | « Signaler cette annonce »              | **Aucun endpoint.** Garé, commenté. Piste : `POST /contact-messages` — §9                                                                                                                                                                                                             |
| **15** | Bascule « Notifications push »          | ⚠️ `POST /notifications/push` attend un **abonnement Web Push** (`endpoint` + `p256dh` de 87 caractères + `auth` de 22, base64url non padé). Un jeton Expo (`ExponentPushToken[…]`) **n'entre pas** dans ce schéma. Bascule **désactivée avec sa raison** tant que §9 n'a pas tranché |
| **16** | Bascules « SMS » et « E-mail »          | Rien ne les stocke — badge « bientôt disponible », comme le client                                                                                                                                                                                                                    |
| **17** | Bascule « Code PIN de sécurité »        | N'existe nulle part. **Retirée**                                                                                                                                                                                                                                                      |
| **22** | Photo de profil (caméra + galerie)      | `uploads` n'expose que `lost-item-photo`. Garé — §9                                                                                                                                                                                                                                   |
| **23** | Le bandeau de statistiques de l'accueil | ⚠️ **N'est plus dans la maquette** (il l'était en juin). `GET /stats/counters` existe, mais l'accueil actuel n'a pas de place pour lui : **ne pas l'ajouter**                                                                                                                         |

### 4.5 Écarts de **parcours d'authentification**

| #      | Maquette                                                                                             | Réel                                                                                                                  | Décision                                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **19** | Inscription : nom + téléphone + **mot de passe**, _puis_ OTP                                         | better-auth `phoneNumber()` connecte par OTP ; le mot de passe initial passe par `POST /account/set-initial-password` | **Téléphone → OTP → nom + mot de passe.** L'ordre de la maquette est impossible                                                                                          |
| **20** | « Mot de passe oublié » → « Envoyer le **lien** » → « un **lien** de réinitialisation a été envoyé » | Le public réinitialise **par OTP téléphone** ; le lien par e-mail est le parcours du **backoffice**                   | **Téléphone → code → nouveau mot de passe.** Le mot « lien » ne doit apparaître nulle part                                                                               |
| **18** | « 6 caractères minimum »                                                                             | `passwordSchema` : **8 à 128**, une majuscule, une minuscule, un chiffre                                              | Afficher `PASSWORD_HINT` et `PASSWORD_PLACEHOLDER`. **Ne jamais réécrire la phrase** : un écran qui annonce une règle que le serveur n'applique pas est un rejet garanti |

### 4.6 Écarts d'**intégration** — trouvés en lisant l'API, pas la maquette

| #      | Constat                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **29** | ✅ **Un client natif n'a besoin d'aucun en-tête d'audience.** `resolveAudience` lit `Origin`, sinon `X-Auth-Audience`, sinon rend `'public'`. Une app native n'envoie ni l'un ni l'autre → elle tombe sur l'instance publique, ce qu'on veut. **Ne pas envoyer `X-Auth-Audience`** — c'est l'en-tête du backoffice                                                                                                     |
| **30** | ⚠️ `ALLOWED_ORIGINS` alimente **à la fois** CORS et les `trustedOrigins` de better-auth. Si le client `@better-auth/expo` présente un `Origin` de schéma applicatif (`retrouveci://`), il doit y figurer, sinon better-auth refuse. **À mesurer, pas à supposer** — étape API `MA1`                                                                                                                                    |
| **31** | ⚠️ **Les plafonds d'adresse s'appliquent vraiment à l'app mobile.** Le client web appelle l'API depuis son conteneur : le limiteur voit le front, pas le visiteur. Une app native appelle **en direct** : l'adresse vue est celle de l'appareil. Conséquence : pas de reprise agressive, pas de sondage en boucle, et un `Retry-After` respecté. Le plafond par numéro d'`OtpDispatcher` s'ajoute au plafond d'adresse |
| **32** | Le filtrage des annonces est **serveur** : `listLostItemsFilterSchema` accepte `type`, `category`, `ville`, `commune`, `search`, `dateFrom`, `dateTo` + pagination. La maquette filtre en mémoire sur 8 annonces — **ne pas porter ce code**, poster les filtres                                                                                                                                                       |
| **33** | `notifications/list-filter.schema.ts` n'expose que `read` : **pas de filtre par type**. Les cinq onglets de la feuille de notifications filtrent donc **la page chargée**, côté client, tant que §9 n'a pas tranché l'ajout d'un filtre serveur                                                                                                                                                                        |
| **34** | `/notifications/unread-count` répond un **nombre nu**, pas `{ count }`. Le backoffice s'est fait avoir ; le badge doit lire un nombre                                                                                                                                                                                                                                                                                  |

---

## 5. Découpage en étapes

| Lot               | Étape   | Intitulé                                                                     | Dépend de | Flux |
| ----------------- | ------- | ---------------------------------------------------------------------------- | --------- | ---- |
| **0 · Socle**     | **M1**  | Échafaudage Expo 57 + Turborepo + outillage + **une exécution sur appareil** | —         | —    |
|                   | **M2**  | Jetons, thème (Clair/Sombre/Auto), polices Geist, jeu d'icônes               | M1        | —    |
|                   | **M3**  | Primitives d'interface (les 17 de `ui.jsx`)                                  | M2        | —    |
| **1 · Plomberie** | **M4**  | Coquille de navigation : 4 onglets, Scanner en modale                        | M3        | —    |
|                   | **M5**  | Client API + better-auth Expo + TanStack Query + traduction d'erreurs        | M4        | E    |
|                   | **M6**  | Passerelle `@app/contracts` (résolution Metro) + tables de libellés          | M5        | —    |
| **2 · Accueil**   | **M7**  | Accueil + feuille de notifications                                           | M6        | —    |
| **3 · Annonces**  | **M8**  | Liste, recherche, filtres avancés (serveur)                                  | M7        | A, B |
|                   | **M9**  | Détail d'annonce + contact enregistré puis saut                              | M8        | A, B |
| **4 · Scanner**   | **M10** | Viseur caméra + les quatre issues                                            | M6        | B, C |
|                   | **M11** | Activation d'un sticker (`linkedObject` + `directContact`)                   | M10       | C    |
| **5 · Compte**    | **M12** | En-tête de profil, onglets de section, **Mes annonces avec modération**      | M6        | A    |
|                   | **M13** | Publier une annonce — tunnel 3 étapes + téléversement des photos             | M12       | A    |
|                   | **M14** | Mes stickers + partage                                                       | M11, M12  | C    |
|                   | **M15** | Mes commandes + tunnel de commande **à 3 étapes**                            | M12       | D    |
|                   | **M16** | Paramètres (thème, profil, zone, mot de passe, changement de numéro)         | M12       | E    |
| **6 · Auth**      | **M17** | Connexion, inscription, mot de passe oublié — **OTP 6**                      | M5        | E    |
| **7 · Finition**  | **M18** | Onboarding 3 écrans + garde de premier lancement                             | M4        | —    |
|                   | **M19** | Notifications push — **conditionnée à §9**                                   | M16       | —    |
|                   | **M20** | EAS : profils de build, icônes, écran de démarrage, livraison interne        | M18       | —    |
| **API**           | **MA1** | `ALLOWED_ORIGINS` et le schéma applicatif — **mesurer d'abord**              | —         | E    |
|                   | **MA2** | Filtre par type sur `/notifications/mine` — si §9 le décide                  | —         | —    |
|                   | **MA3** | Route de jeton push natif — si §9 le décide                                  | —         | —    |
|                   | **MA4** | Téléversement d'avatar — si §9 le décide                                     | —         | —    |

### Chemin critique

```
M1 → M2 → M3 → M4 → M5 → M6 ─┬→ M7 → M8 → M9
                              ├→ M10 → M11
                              └→ M12 ─┬→ M13
                                      ├→ M14
                                      ├→ M15
                                      └→ M16 → M19
M5 → M17          M4 → M18 → M20
```

M1 à M6 sont **strictement séquentiels** : ils posent le socle. À partir de M6,
trois branches sont indépendantes et peuvent être menées dans n'importe quel
ordre. **M17 est prioritaire dès que M5 est en place** : sans session, la moitié
des écrans ne peut pas être vérifiée sur données réelles.

### Pilote

**M7 (Accueil)** est l'étape pilote : elle exerce le socle en entier — jetons,
primitives, navigation, client API, contrats, un écran qui liste avec ses trois
états, et une feuille. Si quelque chose du socle est mal posé, M7 le révèle
avant que douze écrans en dépendent.

---

## 6. Détail des étapes

Chaque étape déclare : **ce qu'elle livre**, **ce qu'elle ne fait pas**, les
**écarts §4** qu'elle applique, et son **critère de fin**.

### Lot 0 — Socle

#### M1 — Échafaudage

**Livre** — `apps/mobile` : Expo SDK 57 en flux managé, `expo-router` 57, racine
de routage `src/app/`, TypeScript strict. NativeWind 4.2.6 avec `tailwindcss` 3
épinglé, greffon Babel de NativeWind, `react-native-worklets` **en dernier**,
`react-native-css-interop` en dépendance **directe**. Polices Geist et Geist
Mono via `expo-font`. `app.json` avec les greffons dont les lots suivants auront
besoin (caméra, secure-store, sélecteur d'images, notifications). `package.json`
nommé `@app/mobile`, tâche `start` persistante dans `turbo.json`, scripts racine
`pnpm mobile` / `pnpm mobile:lan`. Jest + `jest-expo` avec le
`transformIgnorePatterns` conscient de pnpm. `.prettierrc.json` **local** sans
le greffon Tailwind. `eas.json` avec un profil `preview` produisant un APK
interne.

**Ne fait pas** — aucun écran de produit ; un `index` provisoire suffit.

**Critère de fin** — ⚠️ **l'app démarre sur un appareil réel**, par le LAN ou
par un APK EAS. `expo export --platform android` réussit. `tsc --noEmit`,
`eslint` et `jest` passent. Sans l'exécution sur appareil, l'étape n'est **pas**
terminée (§3.4).

#### M2 — Jetons, thème, icônes

**Livre** — `src/theme/tokens.ts` transcrivant §2.1 au caractère près, en deux
palettes. `usePalette()` / `useScheme()` adossés au store Zustand, trois modes
**Clair / Sombre / Auto** (`Auto` écoute `Appearance`).
`src/components/Icon.tsx` portant les **51 tracés** d'`ICON_PATHS` sur
`react-native-svg`, même grille de 24, même `strokeLinecap`/`strokeLinejoin`.

**Ne fait pas** — les primitives (M3).

**Critère de fin** — un écran de démonstration montre les 51 icônes et les deux
palettes ; la bascule de thème fonctionne sans rechargement.

#### M3 — Primitives

**Livre** — les 17 primitives de `ui.jsx`, aux mesures de §2.2 : `StatusBar`
(insets natifs, pas la barre dessinée du prototype), `MeshBg` (⚠️ `useId()` pour
chaque `<defs>`), `Btn` (8 variantes × 3 tailles), `IconBtn`, `Card`, `Avatar`,
`ObjectThumb` (motif rayé `Pattern`, ou `src`), `StatusBadge`, `Chip`, `Field`,
`Segmented`, `TopBar`, `Sheet` (`@gorhom/bottom-sheet`), `TabBar` (verre,
`expo-blur`), `HScroll`, `Skeleton`, `EmptyState`, `Toast`. Plus, venues
d'`account.jsx` : `ConfirmDialog`, `SettingRow`, `Toggle`, `SectionTabs`, et
d'`listings.jsx` : `Selector`, `OptionPicker`.

**Ne fait pas** — aucune donnée, aucun appel.

**Critère de fin** — une galerie de composants montre chaque primitive dans ses
variantes, en clair et en sombre. Tests Jest sur `Btn` et `Icon`.

### Lot 1 — Plomberie

#### M4 — Coquille de navigation

**Livre** — disposition racine (garde d'écran de démarrage, fournisseurs Query,
gestes, feuilles), groupe d'onglets à **4** entrées avec la `TabBar` de M3, ⚠️
**Scanner pousse `(modals)/scan`** et n'est pas un onglet (§2.3). Modales
`(modals)/auth`, `(modals)/order` en présentation plein écran. Route
`annonce/[id]`.

**Critère de fin** — la navigation entre les trois onglets et l'ouverture des
trois modales fonctionnent, avec des écrans vides.

#### M5 — Client API, session, requêtes

**Livre** — `src/services/api.client.ts` : client HTTP sur `API_BASE_URL` lu à
l'exécution (`expo-constants`), ⚠️ **sans `X-Auth-Audience`** (§4, écart 29).
`auth-client.ts` : better-auth avec `phoneNumberClient()` et le client Expo,
stockage `expo-secure-store`, schéma `retrouveci`. ⚠️ **Le jeton ne transite
jamais par l'état React** — il vit dans le magasin sécurisé. Le cycle
`api.client` ↔ `auth-client` se casse par un `config.ts` tiers. Fournisseur
TanStack Query avec des reprises **conservatrices** (§4, écart 31) : pas de
reprise sur 4xx, respect de `Retry-After` sur 429.

Traduction d'erreurs : l'API répond
`400 { message: 'Validation failed', errors: { champ: [...] } }` et
`DomainExceptionFilter` répond la **même** carte pour un refus métier. Un
utilitaire transforme cette carte en erreurs de champ ; ce qui ne nomme aucun
champ devient une erreur de formulaire. C'est la transposition de
`withApiOperationError` du web — même règle, sans React Router.

**Critère de fin** — un appel authentifié et un appel anonyme réussissent contre
l'API locale ; un 400 avec `errors` se pose sur le bon champ ; le jeton survit
au redémarrage de l'app.

#### M6 — Passerelle `@app/contracts`

**Livre** — la résolution de `@app/contracts` par Metro. ⚠️ **C'est un vrai
point technique, pas une formalité** : le paquet fait pointer `types` et
`import` sur `src` (TypeScript) et `require` sur `dist` (CJS). Metro doit donc
soit compiler le `src` TypeScript du paquet voisin (`watchFolders` sur la racine
du dépôt + `unstable_enablePackageExports`), soit consommer `dist`. **Mesurer
les deux et consigner le choix ici.**

Livre aussi les tables de libellés que la §4 impose, chacune `Record<Enum, …>` —
**exhaustive par le type** :

- `LOST_ITEM_CATEGORIES` → libellé + `tone` (§4, écart 6) ;
- `LOST_ITEM_TYPES` → « Perdu » / « Retrouvé » et la couleur ;
- `RESOLUTION_STATUSES`, `MODERATION_STATUSES` → libellés du propriétaire ;
- `STICKER_ORDER_STATUSES` → libellés de suivi ;
- les huit types de notification d'audience `user` → icône + teinte (§4, écart
  8).

**Critère de fin** — un test rougit quand une valeur est ajoutée à un enum du
contrat sans libellé. `expo export` réussit avec le paquet importé.

### Lot 2 — Accueil

#### M7 — Accueil (**pilote**)

**Livre** — l'accueil de `home.jsx` : en-tête (salutation, cloche à pastille,
avatar), barre de recherche qui **pousse vers l'onglet Annonces avec le focus**,
grande carte dégradée « Scanner un sticker », deux sous-actions (« Commander un
sticker » → tunnel avec `source: 'home'` ; « Faire une annonce » → publication),
carte « Se connecter » quand la session manque, et « Dernières annonces » en
défilement horizontal alimenté par `GET /lost-items` (5 éléments).

Feuille de notifications : `GET /notifications/mine`, `PATCH /:id/read`,
`PATCH /read-all`, badge par `/notifications/unread-count` — ⚠️ **un nombre nu**
(§4, écart 34). Cinq onglets de filtre appliqués **sur la page chargée** (§4,
écart 33).

**Applique** — écarts 8, 33, 34. **Pas** l'écart 23 : le bandeau de statistiques
n'est plus dans la maquette, on ne le réintroduit pas.

**Critère de fin** — l'accueil affiche de vraies annonces, la cloche un vrai
compte, « Tout lire » remet le badge à zéro, les trois états de liste sont
visibles, le mode sombre est propre.

### Lot 3 — Annonces

#### M8 — Liste, recherche, filtres

**Livre** — `ListingsScreen` : recherche, bouton de filtres à pastille de
compte, `Segmented` Tous / Objets perdus / Objets retrouvés (teintes orange et
verte), puces de filtres actifs, liste d'`AnnonceRow` paginée. `FiltersSheet` :
ville, commune (⚠️ n'a de sens que pour Abidjan — la maquette le sait déjà),
période.

**Applique** — écart 32 : **tout part au serveur**. `search`, `type`,
`category`, `ville`, `commune`, `dateFrom`/`dateTo` sont des paramètres de
`listLostItemsFilterSchema`. Le filtrage en mémoire de `listings.jsx` ne se
porte pas. La « période » se traduit en `dateFrom` (⚠️ elle était purement
décorative en juin, faute de date exploitable dans les données factices ; elle
ne l'est plus).

**Critère de fin** — un filtre modifie la requête réseau, la pagination charge
la suite, l'état vide propose de réinitialiser.

#### M9 — Détail et contact

**Livre** — le détail de `AnnonceDetail` en écran (`annonce/[id]`) plutôt qu'en
feuille — il porte trop de contenu et une action dominante. Photos réelles,
pastille, catégorie, lieu, date, description, encart auteur, et **deux actions**
: WhatsApp et Appeler.

**Applique** — écart 12 : `POST /lost-items/:id/contact` **d'abord**, puis
`Linking.openURL`. Si l'enregistrement échoue, **le saut n'a pas lieu** et le
message le dit. Écart 13 : « Signaler » reste, **commentée**, avec son marqueur.

**Critère de fin** — le contact apparaît côté API, la notification
`listing_contacted` part, et WhatsApp s'ouvre bien sur l'appareil.

### Lot 4 — Scanner

#### M10 — Viseur et issues

**Livre** — `(modals)/scan` : `expo-camera` en plein écran, lecture de QR,
torche, viseur animé (coins + ligne), amorce de permission, et une **saisie
manuelle du code** en repli — l'app doit rester utilisable si la caméra est
refusée.

**Applique** — écart 2 : le code lu est validé contre **`RCI-XXXXXX`**, et la
carte pédagogique annonce ce format. Écart 27 : **quatre** issues — `activated`
(§M9 pour le contact), `generated` (→ M11), `revoked` (écran neuf : « ce sticker
a été désactivé »), et **code inconnu** (404 de `GET /qr-codes/:code/scan`).
Écart 26 : sur `activated`, `POST /:code/contact` est toujours offert ;
`POST /:code/reach` **seulement si `directContact`**.

**Critère de fin** — les quatre issues sont atteignables, dont `revoked` et le
404 ; un QR étranger tombe bien sur « non reconnu ».

#### M11 — Activation

**Livre** — l'écran « Configurer ce sticker » : nom de l'objet, et — nouveauté
imposée par §4 — le **choix du contact direct**.

**Applique** — écart 28 : « Nom de l'objet » → `linkedObject` (≤ 120,
`QR_LINKED_OBJECT_MAX_LENGTH`), `directContact` **par défaut `false`** et
explicite, puisque la maquette promet « sans voir votre numéro ». Écran de
succès, puis retour vers Compte · Mes stickers.

**Critère de fin** — un sticker `generated` devient `activated` et apparaît dans
`GET /qr-codes/mine` ; un sticker déjà activé par quelqu'un d'autre est refusé
proprement.

### Lot 5 — Compte

#### M12 — Profil, sections, **Mes annonces**

**Livre** — l'en-tête de profil (avatar, nom, téléphone), `SectionTabs` à quatre
entrées avec leurs compteurs, et la section « Mes annonces » :
`GET /lost-items/mine`, `MyAnnonceCard`, marquer résolu
(`PATCH /lost-items/:id`), modifier, supprimer derrière `ConfirmDialog`.

**Applique** — ⚠️ **écart 9, le plus important du plan.** Chaque carte porte son
`moderationStatus` ; en `pending`, un bandeau explique que l'annonce **n'est pas
encore visible** ; en `hidden`, la **phrase** du motif importée de
`moderation-reason.ts`. Écart 7 : la pastille montre le **type**, le bandeau «
Résolu » la **résolution**. Écart 22 : la photo de profil est **garée**,
commentée.

**Critère de fin** — une annonce en attente et une annonce masquée sont toutes
deux lisibles par leur propriétaire, avec la même phrase que la notification.

#### M13 — Publier une annonce

**Livre** — un tunnel à **3 étapes** hors coquille (Objet → Lieu et date →
Contact), aligné sur celui du client, avec sa barre d'action basse.

**Applique** — écart 10 : `eventDate`, `contactName`, `contactWhatsapp` sont
requis, et les champs de pièce apparaissent quand la catégorie vaut `documents`.
Écart 11 : `POST /uploads/lost-item-photo` **avant** la publication, 5 photos au
plus. Écart 6 : les 9 catégories, pas 5. Écart 9 : l'écran de succès dit que
l'annonce **passe en modération** — elle naît `pending`, et le taire est ce qui
a coûté cher.

**Critère de fin** — une annonce publiée depuis le mobile apparaît dans le
backoffice en attente, avec ses photos.

#### M14 — Mes stickers

**Livre** — la liste de `GET /qr-codes/mine`, `StickerCard` (QR, code en Geist
Mono, objet lié, état, nombre de scans), bouton « Activer un sticker » qui ouvre
le scanner en mode activation, et `ShareSheet` — cinq canaux, message prérempli.

**Applique** — écart 2 : les codes s'affichent en `RCI-XXXXXX`. Le message de
partage nomme **le vrai format**. `GET /qr-codes/mine/summary` alimente le
compteur de stickers livrés en attente d'activation, ⚠️ que la liste `mine` **ne
peut pas** montrer, faute de propriétaire.

**Critère de fin** — partager ouvre bien WhatsApp avec le message attendu ; le
compteur d'attente est juste.

#### M15 — Commandes et tunnel de commande

**Livre** — la section « Mes commandes » (`GET /sticker-orders/mine`,
`CommandeCard` avec le libellé de statut) et le tunnel `(modals)/order`.

**Applique** — ⚠️ **écarts 3, 4 et 5, ensemble.** Le tunnel passe à **3 étapes**
: Pack → Livraison → Confirmé. Le catalogue vient de `STICKER_PACKS_BY_ID`
(`pack-4` 2 000, `pack-8` 3 500, `pack-20` 7 000). Le corps posté est
`createStickerOrderSchema` : `packId`, `deliveryAddress`, `deliveryCity`,
`deliveryNotes`, `couponCode`, `source`. **Aucun champ de paiement.** L'écran de
confirmation nomme `PAYMENT_ON_DELIVERY_LABEL` et **la somme à préparer**. Le
catalogue mobile-money d'`order.jsx` est **commenté** en bloc, avec son marqueur
de raison. `source` vaut `home` ou `account` selon l'entrée (§2.4, flux D).

⚠️ Une limite du domaine que la maquette ignore : `CreateStickerOrderUseCase`
**refuse** une commande de plus quand le compte en tient déjà
`MAX_OPEN_STICKER_ORDERS` ouvertes. Ce refus arrive comme une erreur de
formulaire et doit être **lisible**, pas générique.

**Critère de fin** — une commande passée depuis le mobile apparaît dans le
backoffice avec la bonne source, le bon prix et `cash-on-delivery` ; le refus de
plafond s'affiche en clair.

#### M16 — Paramètres

**Livre** — Apparence (les trois modes), Informations personnelles (nom, zone
ville/commune), Sécurité (mot de passe), Notifications, Zone de danger
(déconnexion, suppression de compte).

**Applique** — écart 18 : `PASSWORD_HINT` / `PASSWORD_PLACEHOLDER` affichés tels
quels, et `passwordSchema` pour la validation. Le changement de numéro garde son
sous-parcours OTP — ⚠️ **à 6 chiffres**, ce que la maquette fait déjà **ici**
(écart 1). Écart 21 : la zone écrit `city` / `commune` sur le profil
better-auth. Écarts 15, 16, 17 : push désactivée avec sa raison, SMS et e-mail
en « bientôt disponible », code PIN **retiré**.

**Critère de fin** — changer de numéro fonctionne de bout en bout ; un mot de
passe à 6 caractères est refusé **par le formulaire**, avec la phrase du
contrat.

### Lot 6 — Authentification

#### M17 — Connexion, inscription, oubli

**Livre** — `(modals)/auth` avec ses vues, et `AuthGate` pour l'onglet Compte
hors session.

**Applique** — écart 1 : `OtpInput` à **6** cases, minuterie sur
`OTP_RESEND_DELAY_SECONDS` (30), expiration sur `OTP_TTL_SECONDS` (300). Écart
19 : **téléphone → OTP → nom + mot de passe** via
`POST /account/set-initial-password`. Écart 20 : l'oubli passe par un **code**,
et le mot « lien » ne figure nulle part. Écart 31 : le renvoi de code respecte
le délai et le `Retry-After` — le plafond par numéro d'`OtpDispatcher` est réel.

**Critère de fin** — inscription et connexion complètes contre l'API, session
persistée, un code erroné donne un message français.

### Lot 7 — Finition

#### M18 — Onboarding

**Livre** — les 3 écrans d'`onboarding.jsx` avec leurs illustrations (`OnbArt` :
`lost`, `sticker`, `community`), pagination, « Passer », et la garde de premier
lancement (drapeau en magasin sécurisé, dégradé en « passer » si le magasin est
indisponible).

**Critère de fin** — vu une fois, jamais revu ; réinitialisable depuis un
réglage de développement.

#### M19 — Notifications push — **conditionnée**

⚠️ **Ne pas démarrer avant que §9 ait tranché.** L'API n'accepte aujourd'hui
qu'un abonnement **Web Push** ; un jeton Expo ne rentre pas dans son schéma (§4,
écart 15). Deux issues possibles : `MA3` ajoute une route de jeton natif, ou la
bascule reste désactivée avec sa raison. Le second choix est **acceptable** pour
une v1.

#### M20 — Livraison

**Livre** — icônes d'application, écran de démarrage, `app.json` complet,
profils EAS (`preview` APK interne, `production`), et la procédure de diffusion.

### Étapes API

#### MA1 — Origines de confiance

⚠️ **Mesurer d'abord, changer ensuite.** Instrumenter un appel
`@better-auth/expo` et **lire l'en-tête `Origin` réellement émis** — le lire
dans le code ne prouve rien (c'est la leçon de l'affaire `qs`). S'il porte un
schéma applicatif, l'ajouter à `ALLOWED_ORIGINS`, qui alimente **à la fois**
CORS et les `trustedOrigins` (§4, écart 30). S'il n'en porte pas, **ne rien
changer** et le consigner ici.

#### MA2 · MA3 · MA4 — Suspendues à §9.

---

## 7. Ce qui ne bouge pas

- **`apps/client`, `apps/admin`, `apps/api` ne sont pas modifiés** par les
  étapes M. Seules les étapes `MA` touchent l'API, et chacune est justifiée par
  une §9 tranchée.
- **Aucun contrat n'est assoupli pour arranger la maquette.** Les prix, les
  longueurs, la règle de mot de passe et la longueur d'OTP sont ce qu'ils sont.
- **`packages/ui` reste web.** Aucune tentative de composant universel.
- **Le monorepo reste en Tailwind 4** ; `apps/mobile` est un îlot Tailwind 3
  assumé (§3.1).
- **La numérotation des étapes ne change jamais.** Une étape ajoutée prend le
  numéro suivant, même si elle appartient logiquement à un lot antérieur.

---

## 8. Vérification avant chaque merge

```bash
pnpm run typecheck
pnpm run lint --force
pnpm run test --force
pnpm run format:check
pnpm --filter @app/mobile test
pnpm --filter @app/mobile exec expo export --platform android
```

Puis, à la main :

1. l'écran livré, **en clair et en sombre** ;
2. le ou les flux de §2.4 que l'étape touche, **en entier**, sur un appareil ;
3. les trois états de toute liste (chargement, vide, erreur) ;
4. la relecture contre **§2.5** et contre les écarts §4 que l'étape déclare.

⚠️ `expo export` fait foi, pas la sortie d'un Metro déjà lancé (§1, point 2).

---

## 9. Points à trancher

Aucun n'empêche de démarrer ; chacun bloque **une** étape nommée.

1. **Notifications push (bloque M19).** L'API n'accepte qu'un abonnement Web
   Push. Ajouter une route de jeton natif (`MA3`), ou livrer la v1 avec la
   bascule désactivée et sa raison ? Le compteur `GET /stats/push-subscriptions`
   que le backoffice lit compte des navigateurs : y verser des appareils natifs
   changerait le sens de la mesure sur laquelle la décision « le push atteint-il
   quelqu'un ? » a été prise. **Recommandation : v1 sans push**, et trancher
   ensuite avec la mesure en main.
2. **Filtre de notifications par type (bloque le confort de M7).** Filtrer côté
   client la page chargée suffit-il, ou faut-il un paramètre `type` sur
   `/notifications/mine` (`MA2`) ? **Recommandation : client d'abord**, serveur
   si la pagination rend le filtre trompeur.
3. **« Signaler une annonce » (bloque une finition de M9).** Aucun endpoint.
   Router vers `POST /contact-messages` avec un objet préformaté, ou créer un
   vrai domaine de signalement ? **Recommandation : `contact-messages`**, qui
   arrive déjà sur le bureau du desk.
4. **Photo de profil (bloque une finition de M12).** `uploads` n'expose que
   `lost-item-photo`. Ajouter `MA4`, ou s'en tenir aux initiales ?
   **Recommandation : initiales en v1** — l'avatar dégradé de la maquette est
   déjà soigné.
5. **Villes et communes.** La maquette fige 10 villes et 12 communes d'Abidjan ;
   le contrat accepte du texte libre (2 à 120). Garder le sélecteur fermé (bonne
   ergonomie, données propres) ou autoriser la saisie libre (couverture
   nationale) ? **Recommandation : sélecteur + « Autre » en saisie libre.**
6. **Parité de fonctionnalités avec la PWA.** Le mobile n'a pas de pages
   d'atterrissage SEO, pas de `/q/:code` (c'est le rôle du web), pas de
   `/offline`. Confirmer que **ce n'est pas un manque** mais le partage des
   rôles : le web accueille l'inconnu qui scanne, le mobile sert le client qui
   revient.
7. **Diffusion.** Play Store, ou APK interne pour commencer ? Le second lève la
   contrainte réseau de §3.4 immédiatement.

---

## 10. Références

- **Maquette Claude Design** — projet `53f4ce9a-a1b7-42e3-939a-c0800a31820c`.
  Onze fichiers : `index.html` (harnais 390×844 + jetons + polices),
  `tweaks-panel.jsx` (panneau d'édition, **hors produit**), `data.jsx` (51
  icônes, matrice QR, données factices), `ui.jsx` (17 primitives),
  `onboarding.jsx`, `auth.jsx`, `home.jsx`, `listings.jsx`, `order.jsx`,
  `account.jsx`, `scan.jsx`, `app.jsx` (coquille et navigation).
- **Contrats** —
  `packages/contracts/src/{lost-items,qr-codes,sticker-orders,notifications,shared}`.
- **API** — `apps/api/src/presentations/` ; audience et origines dans
  `apps/api/src/shared/auth/`.
- **PWA de référence** — `apps/client/app/routes/` : `publish/` (le tunnel à 3
  étapes), `scan/` (les issues), `q/` (les deux canaux de contact),
  `account/posts/` (l'affichage de modération).
- **`REFONTE-PLAN.md`** — la méthode de travail de §1 en est reprise, et sa §2
  reste la référence des invariants du **web**.
- **`CLAUDE.md`** — normatif sur le monorepo ; en cas de désaccord avec ce
  document sur un sujet non mobile, c'est lui qui gagne.
