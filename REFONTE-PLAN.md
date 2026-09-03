# Plan de refonte — interfaces mobiles, scanner QR et bascule PWA

> Objectif : refondre `apps/client` en partant du téléphone, remonter les
> stickers QR au rang de produit visible, ajouter un scanner intégré, compléter
> le mode sombre, et rendre l'application installable.
>
> Documents de travail : l'**audit** (31 constats priorisés, mesures de
> contraste, plan par lots) et le **canevas de wireframes** (48 écrans sur 8
> pages) — liens en §9.
>
> Le **lot 9 (authentification)** a été ajouté après l'écriture initiale : les
> écrans de connexion, d'inscription et de récupération n'étaient pas dans le
> périmètre de départ. Il porte les numéros R26 à R30 et ne renumérote rien — R1
> est déjà mergée (PR #150) et R2–R25 sont référencées dans tout ce document,
> dans les messages de passation et dans l'historique git.

---

## 1. Méthode de travail (contraignante)

La refonte est **incrémentale**. Chaque étape `R<n>` du tableau §4 suit
exactement ce cycle :

1. **Branche dédiée** depuis `refonte` : `git switch -c refonte-r<n>-<slug>`.
   > `refonte` est la **branche d'intégration** : toutes les PR d'étape y sont
   > mergées, puis une PR finale `refonte` → `main` clôt le chantier. Le tiret
   > (et non le slash) dans le nom des branches d'étape est imposé par git : une
   > ref `refonte` et une ref `refonte/r1-…` ne peuvent pas coexister.
2. **Travail + vérification locale** :
   ```bash
   pnpm run typecheck && pnpm run lint --force && pnpm run test --force && pnpm run format:check
   ```
   > `--force` sur `lint` et `test` : sans lui, Turbo répond « cached » et
   > n'exécute rien. Ajouter `pnpm run build` dès qu'une étape touche
   > `app/routes.ts` — `typecheck` seul ne voit pas un module de route déplacé.
3. **Demander la permission avant de committer.** L'agent ne lance jamais
   `git commit` de sa propre initiative, et committe par pathspec
   (`git commit -- <chemins>`), jamais l'index entier.
4. **Pull request via `gh`** (`gh pr create --base refonte`), description au
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

Ce plan chiffre ce qu'il a compté (31 boutons-icônes, 5 Mo de photo, 2,70:1 de
contraste). Avant d'appliquer une prescription, **recompter les points d'appel
réels** : si l'écart est significatif, corriger ce document dans la PR de
l'étape plutôt que de laisser diverger le plan et le code.

---

## 2. Invariants d'interface et de flux

> **C'est la section qui protège le chantier.** Vingt-huit PR écrites sur
> plusieurs semaines produisent vingt-huit dialectes si rien ne les tient. Toute
> PR d'étape est relue contre cette section avant d'être mergée.

### 2.1 Vocabulaire d'interface

Un même rôle, une même forme. Ces primitives sont posées par R2 et R3 ; aucune
étape ultérieure n'en invente d'autres.

| Rôle                     | Forme imposée                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Action primaire          | Bouton plein vert `--primary-green`, texte blanc, 48 px, rayon 14 (R33)                     |
| Action secondaire        | Contour 1,5 px `--border`, encre `--foreground`, même hauteur                               |
| Action « objet perdu »   | Aplat `--accent-orange` + **encre foncée** — jamais de blanc (2,70:1)                       |
| Action destructrice      | Contour rouge, jamais un aplat ; toujours derrière une confirmation                         |
| Cible tactile            | 44 px minimum sous `lg`, sans exception — la **zone de tap**, pas le dessin                 |
| Champ de saisie          | 48 px (R33), police 16 px partout via `text-field` (sous 16, iOS zoome au focus)            |
| Carte                    | Rayon 14, bordure 1 px `--border`, photo 84 px en liste, 108 px en grille                   |
| Pastille d'état          | 22 px, capitales 12 px (R33), `letter-spacing` 0.04em — une seule forme pour tous les états |
| Puce de filtre           | Capsule 34 px (R33) ; active = fond `--foreground`, texte `--background`                    |
| **Bannière**             | Une exception qui appelle une action ou une explication (modération, hors-ligne, livraison) |
| **Feuille inférieure**   | Un panneau qui interrompt : filtres, menu `⋯`, activation d'un sticker                      |
| **Barre d'action basse** | Un écran qui a **une** action dominante : détail d'annonce, tunnel de commande, formulaire  |
| Défilement horizontal    | Réservé aux listes secondaires (catégories, annonces récentes) — jamais à une action        |

**Ce qui n'existe plus** : le menu latéral, la bulle flottante permanente, les
boutons-icônes sous 44 px, le texte blanc sur orange, le texte vert de marque
sur fond sombre, et **toute taille de police arbitraire sur la base mobile** —
`text-[10px]` et `text-[11px]` comprises. L'échelle mobile compte sept barreaux
nommés, posés par R33 : 12, 13, 14, 15, 16, 18 et 26 px.

### 2.2 Les cinq flux de bout en bout

Chaque étape déclare le ou les flux qu'elle touche. Avant de merger, dérouler le
flux **entier** sur un téléphone, pas seulement l'écran modifié.

#### Flux A — « J'ai perdu un objet »

```
Accueil → « J'ai perdu » → Publier 1/3 → 2/3 (+ correspondances) → 3/3
        → Mes annonces → correspondances → Détail → Contact WhatsApp
```

Étapes concernées : R16, R17, R18, R11–R14, R10. Invariant : la même annonce
porte le même titre, la même pastille d'état et le même couple lieu/date sur les
cinq écrans où elle apparaît.

#### Flux B — « J'ai trouvé un objet »

```
(a) Sans l'app : appareil photo → /q/:code → Prévenir sur WhatsApp
(b) Avec l'app : onglet Scanner → /q/:code → Prévenir
(c) Sans sticker : Accueil → « J'ai trouvé » → Publier → Annonce en ligne
```

Étapes concernées : R19, R20, R21, R18, R16. Invariant : `/q/:code` est le
**seul** écran de contact, quel que soit le chemin d'arrivée. Le scanner n'en
crée pas une variante.

#### Flux C — « J'achète et j'active des stickers »

```
Accueil (bloc produit, position 2) → Stickers → Commande 1/3 → 2/3 → 3/3
        → Mes commandes (suivi) → livraison → bandeau d'accueil
        → Scanner → activation → « Scanner le suivant » ×12 → Mes stickers
```

Étapes concernées : R17, R15, R20, R22. Invariant : le prix et le libellé du
pack viennent de `@app/contracts/sticker-orders` — jamais d'une constante de
page. « Payé à la livraison » se dit avec les mêmes mots partout.

#### Flux D — « Je gère mes annonces »

```
Compte → Mes annonces → [bannière modération] → carte → menu ⋯
        → Marquer retrouvé | Modifier | Partager | Supprimer
```

Étapes concernées : R11, R12, R13, R14. Invariant : les deux axes d'état ne se
mélangent jamais (§2.3).

#### Flux E — « Je crée mon compte »

```
Action protégée (publier, commander, activer) → /auth/login
        → « Créer un compte » → Inscription 1/3 (numéro) → 2/3 (code SMS)
        → 3/3 (mot de passe) → retour à l'action d'origine (redirectTo)

Oubli : /auth/login → Mot de passe oublié (numéro)
        → Code + nouveau mot de passe (un seul écran) → Connexion
```

Étapes concernées : R26, R27, R28, R29, R30. Deux invariants :

1. **Un numéro saisi vaut un SMS livrable.** La règle ivoirienne
   (`^0[157]\d{8}$`, §3) s'applique partout où un numéro est saisi pour la
   première fois — inscription, changement de numéro, contact d'annonce,
   commande, contact QR. La **connexion** et la **récupération de compte**, à
   l'inverse, acceptent ce qui est déjà en base : resserrer la règle sur ces
   deux chemins verrouillerait dehors un compte existant.
2. **Le `redirectTo` traverse les trois étapes.** Qui arrive sur l'inscription
   depuis « Publier » revient à « Publier », pas à l'accueil.

### 2.3 Règles de cohérence à vérifier à chaque PR

1. **Un état, une source.** `moderationStatus` (subi) s'affiche en bannière et
   en pastille ; `resolutionStatus` (choisi) pilote les filtres. Ne jamais les
   fusionner en une seule valeur d'affichage.
2. **Un mot, un sens.** « Perdu » / « Retrouvé » pour le type d'objet. « En
   ligne » / « Retrouvé » / « Archivée » pour le cycle de vie. « En attente » /
   « Masquée » pour la modération. Pas de synonymes.
3. **Une action, un libellé.** « J'ai perdu » et « J'ai trouvé » partout —
   accueil, header desktop, formulaire. Jamais « Objet perdu » ailleurs.
4. **Aucun succès annoncé avant la réponse.** Toast et navigation dans un
   `useEffect` gardé sur `fetcher.isOk`, jamais avant `submit`.
5. **Quatre états par écran.** Vide, chargement, erreur, plein. Un écran qui
   n'en dessine que deux n'est pas fini.
6. **Aucun composant n'appelle l'API.** Tout passe par `servers/*.loader.ts` /
   `*.action.ts`, ou un `helpers/*.client.ts` quand le navigateur a besoin du
   `Set-Cookie`.
7. **Les actions répondent `ActionResult`.** `{ success, data?, errors? }`, lues
   par `useActionFetcher`, `errors` passé à `useForm`.
8. **Le mode sombre n'est pas une passe finale.** Chaque écran livré est vérifié
   dans les deux thèmes dans la même PR.

---

## 3. Décisions déjà prises

| Sujet                      | Décision                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Barre d'onglets mobile     | **Option C** : Accueil · Annonces · (+) · **Scanner** · Compte                                        |
| Point focal                | « Publier » le garde — c'est le moteur de contenu                                                     |
| Onglet Stickers            | **Supprimé.** « Mes stickers » va dans Compte, l'acquisition passe par le bloc produit de l'accueil   |
| Icône scanner du header    | Retirée : l'onglet la rend redondante                                                                 |
| Menu latéral (`MobileNav`) | Supprimé ; les liens légaux redescendent au pied de page                                              |
| `ActivityHub`              | Fusionné dans l'écran Compte                                                                          |
| Bascule de navigation      | `md` → **`lg`** : la tablette garde les onglets                                                       |
| Scanner sur desktop        | **Aucun.** L'équivalent est la saisie du code, sur la page Stickers                                   |
| Vert de marque en sombre   | `--primary-green-text` **#2FA85B** (R3 : #2A9D54 tombait à 4,35 sur `--muted`)                        |
| Orange en texte, en clair  | `--accent-orange-text` **#A85000** (R3 : #B35600 tombait à 4,06 sur `bg-accent-orange/20`)            |
| Aplat orange               | `--accent-orange-foreground` #181B1F, **fixe dans les deux thèmes**, jamais du blanc (2,70:1)         |
| Thème                      | Troisième valeur `system`, qui devient le **défaut**                                                  |
| Règle du numéro            | `^0[157]\d{8}$`, et **deux prédicats** : strict à la saisie, longueur seule à la connexion (R26)      |
| Durée de vie de l'OTP      | Une seule constante, `OTP_TTL_SECONDS` remontée dans `@app/contracts/shared` (front : 120, API : 300) |
| Panneau de marque auth     | Se couche en bandeau entre `md` et `lg` au lieu de disparaître — même bascule que la navigation       |
| Compteurs du panneau       | Branchés sur des données réelles, ou rien du tout. Jamais de chiffre écrit en dur                     |

**Écarté, conservé comme trace** : option A (le scanner au centre, « Publier »
déplacé) et option B (capsule à deux actions). À rouvrir si les stickers
deviennent l'axe principal du produit, ou si les deux actions se révèlent
également fréquentes à l'usage.

---

## 4. Découpage en étapes

Une ligne = une branche = une PR = une session.

| #       | Lot      | Étape                                       | Branche                                    | Scope commit                         | Charge | Dépend de    |
| ------- | -------- | ------------------------------------------- | ------------------------------------------ | ------------------------------------ | ------ | ------------ |
| **R1**  | Socle    | Zones sûres de l'appareil                   | `refonte-r1-safe-areas`                    | `client`                             | 0,2 j  | —            |
| **R2**  | Socle    | Cibles tactiles 44 px sous `lg`             | `refonte-r2-touch-targets`                 | `ui` + les deux apps                 | 0,5 j  | —            |
| **R3**  | Socle    | Tokens de couleur accessibles               | `refonte-r3-colour-tokens`                 | `ui` + `client`                      | 1 j    | —            |
| **R4**  | Socle    | Photos servies à la taille d'affichage      | `refonte-r4-image-sizes`                   | `client`                             | 1 j    | —            |
| **R5**  | Coquille | Thème dans Réglages + option `system`       | `refonte-r5-theme-settings`                | `client`                             | 1 j    | R3           |
| **R6**  | Coquille | Barre d'onglets à 4 entrées + Scanner       | `refonte-r6-tab-bar`                       | `client`                             | 1,5 j  | R2, R5       |
| **R7**  | Coquille | En-tête desktop en trois zones              | `refonte-r7-desktop-header`                | `client`                             | 1 j    | R2           |
| **R8**  | Annonces | Filtres en feuille inférieure               | `refonte-r8-filters-sheet`                 | `client/posts`                       | 1 j    | R2           |
| **R9**  | Annonces | Pagination compacte                         | `refonte-r9-pagination`                    | `client/posts`                       | 0,5 j  | —            |
| **R10** | Annonces | Barre d'action basse sur le détail          | `refonte-r10-detail-action-bar`            | `client/posts`                       | 1 j    | R2           |
| **R11** | Compte   | Filtres de Mes annonces pilotés par l'URL   | `refonte-r11-account-url-filters`          | `client/account`                     | 1 j    | —            |
| **R12** | Compte   | Retours honnêtes sur les actions d'annonce  | `refonte-r12-account-feedback`             | `client/account`                     | 1 j    | —            |
| **R13** | Compte   | Refonte de la carte d'annonce               | `refonte-r13-account-listing-card`         | `client/account`                     | 1,5 j  | R2, R11, R12 |
| **R14** | Compte   | Correspondances sur une annonce             | `refonte-r14-account-matches`              | `client/account`                     | 1 j    | R13          |
| **R15** | Compte   | Stickers, commandes et réglages             | `refonte-r15-account-screens`              | `client/account`                     | 1,5 j  | R2, R5       |
| **R16** | Accueil  | Hero reconstruit sur une grille             | `refonte-r16-home-hero`                    | `client/home`                        | 1 j    | R3           |
| **R17** | Accueil  | Annonces récentes et bloc stickers          | `refonte-r17-home-listings-stickers`       | `client/home`                        | 1 j    | R4, R16      |
| **R18** | Publier  | Publication en trois étapes + brouillon     | `refonte-r18-publish-steps`                | `client/publish`                     | 1,5 j  | R2           |
| **R19** | Publier  | Refonte de la page de scan publique         | `refonte-r19-qr-landing`                   | `client/q`                           | 1 j    | R3           |
| **R20** | Scanner  | Écran caméra et amorce de permission        | `refonte-r20-scanner-camera`               | `client/scan` + `contracts`          | 1,5 j  | R6           |
| **R21** | Scanner  | Décodeur WASM et repli photo                | `refonte-r21-scanner-fallbacks`            | `client/scan`                        | 1 j    | R20          |
| **R22** | Scanner  | Activation de stickers en série             | `refonte-r22-sticker-activation`           | `client/account`                     | 1 j    | R20, R15     |
| **R23** | PWA      | Manifeste, icônes et couleurs de thème      | `refonte-r23-manifest`                     | `client/pwa`                         | 1 j    | R1           |
| **R24** | PWA      | Service worker, coquille et page hors-ligne | `refonte-r24-service-worker`               | `client/pwa`                         | 1,5 j  | R4, R23      |
| **R25** | PWA      | Invite et page d'installation               | `refonte-r25-install`                      | `client/pwa`                         | 1 j    | R23          |
| **R26** | Auth     | Règle du numéro ivoirien                    | `refonte-r26-phone-rule`                   | `contracts`                          | 0,5 j  | —            |
| **R27** | Auth     | Connexion et inscription                    | `refonte-r27-login-register`               | `client/auth`                        | 1,5 j  | R2, R26      |
| **R28** | Auth     | Mot de passe oublié en un écran             | `refonte-r28-password-reset`               | `client/auth`                        | 1 j    | R26, R27     |
| **R29** | Auth     | Layout auth aux trois largeurs              | `refonte-r29-auth-layout`                  | `client/auth`                        | 0,5 j  | —            |
| **R30** | Auth     | Copie et chiffres du panneau de marque      | `refonte-r30-auth-copy`                    | `client/auth`                        | 0,5 j  | R29          |
| **R31** | Auth     | Routes d'authentification sans préfixe      | `refonte-r31-auth-routes`                  | `client/admin`                       | 0,5 j  | —            |
| **R32** | Stickers | Hero produit de la page Stickers            | `refonte-stickers-hero`                    | `client/stickers`                    | 0,5 j  | R2           |
| **R33** | Socle    | Échelle typographique et boutons mobiles    | `refonte-r33-mobile-type-scale`            | `ui` + `client`                      | 1,5 j  | R2, R17      |
| **R34** | Socle    | Gouttière de zones sûres unique             | `refonte-r34-safe-area-gutter`             | `client`                             | 0,5 j  | R1           |
| **R35** | Publier  | Publication guidée d'une pièce              | `refonte-r35-document-publish`             | `client/publish`                     | 1,5 j  | R18, A7      |
| **A1**  | API      | Motif de masquage d'une annonce             | `refonte-a1-moderation-reason`             | `api/lost-items`                     | 1 j    | —            |
| **A2**  | API      | Transformations Cloudinary à l'upload       | `refonte-a2-cloudinary-eager`              | `api/storage`                        | 0,5 j  | —            |
| **A3**  | API      | Notifications poussées sur correspondance   | `refonte-a3-web-push`                      | `api/notifications`                  | 3 j    | R23          |
| **A6**  | API      | Source d'une commande de stickers           | `refonte-a6-order-source`                  | `api/sticker-orders`                 | 0,5 j  | R17          |
| **A7**  | API      | Champs de document sur une annonce          | `refonte-a7-document-fields`               | `api/lost-items`                     | 1,5 j  | R18          |
| **A8**  | API      | Joindre le propriétaire d'un sticker        | `refonte-a8-sticker-reach`                 | `api/qr-codes`                       | 1,5 j  | R19          |
| **R36** | Accueil  | L'arrivée des stickers devient un signal    | `refonte-r36-sticker-arrival-notification` | `client/home` + `api/sticker-orders` | 1 j    | R15, R17     |

**Total ≈ 38,5 j** en séquentiel, dont ≈ 6 j côté API et ≈ 4 j pour le lot 9.
R2/R3, R11/R12 et R26/R29 se parallélisent ; les lots 3 à 6 s'ouvrent ensemble
une fois la coquille posée, et le lot 9 s'ouvre indépendamment d'eux — il ne
partage que `Button` et `Input` (R2) avec le reste du chantier.

### Chemin critique

```
R1 → R23 → R24
R2 ↘
R3 → R5 → R6 → R20 → R21
     ↘         ↘ R22
R4 ────────→ R17
R2 → R8, R10, R18
R2 → R27
R11 + R12 → R13 → R14
R26 → R27 → R28
R29 → R30
```

**R6 est la seule étape à portée globale** : elle supprime `MobileNav`, déplace
`ActivityHub` et change la bascule `md` → `lg`. Toutes les autres sont locales à
une route ou à un paquet.

**R26 doit précéder R27 et R28.** Le lot 9 redessine des formulaires dont les
schémas lisent le prédicat que R26 pose ; les redessiner d'abord obligerait à
les rouvrir. R26 est aussi la seule étape du lot à sortir d'`apps/client` : elle
touche `packages/contracts` et se répercute sur `apps/api` comme sur
`apps/admin`. C'est donc la seule à devoir rebâtir le paquet avant que l'api ne
voie le contrat — `apps/api` lit `@app/contracts` par son `dist`.

**R5 doit précéder R6.** R6 supprime le menu latéral, qui est le seul accès
mobile au sélecteur de thème tant que R5 ne l'a pas posé dans Réglages.

### Pilote

Livrer **R13** (carte d'annonce du compte) avant R8 et R10 : c'est l'écran qui
exerce le plus d'invariants d'un coup — deux axes d'état, feuille inférieure,
menu `⋯`, cible tactile, quatre états d'écran, deux thèmes. Il sert de gabarit
revu et validé pour les autres refontes de liste.

---

## 5. Détail des étapes

### Lot 1 — Socle

> Aucun écran redessiné. Les quatre étapes partent en parallèle, sauf R2 et R3
> qui touchent toutes deux `packages/ui` : les faire relire dans cet ordre.

#### R1 — Zones sûres de l'appareil

**Objectif** : rendre effectives les `env(safe-area-inset-*)` déjà écrites.

1. `root.tsx` : `viewport-fit=cover` dans la balise `viewport`.
2. Vérifier que le retrait bas de `BottomTabBar` et la position d'`ActivityHub`
   se décalent bien sur un appareil à encoche.
3. Ajouter le retrait haut là où un écran plein cadre en a besoin
   (`routes/q/_index.tsx`).
4. **Ajouté à l'exécution.** Faire grandir de l'inset l'espace qui dégage la
   barre dans `routes/layout.tsx` : il valait `pb-16`, soit exactement la
   hauteur de la barre _avant_ l'inset. Activer les zones sûres sans corriger ce
   calage aurait fait passer les dernières lignes de chaque page derrière la
   barre — le bug même que l'étape supprime.
5. **Ajouté à l'exécution.** Prendre aussi les insets gauche et droit sur la
   barre, qui est `fixed inset-x-0` : en paysage sur un appareil à encoche, elle
   passe sinon sous la découpe.

> **Vérifié** : `calc(4rem+env(…))` sans espace autour du `+` serait du CSS
> invalide, et c'est la forme qu'employait déjà `ActivityHub`. Le CSS généré
> montre que Tailwind v4 la normalise en
> `calc(4rem + env(safe-area-inset-bottom))` — les deux écritures sont donc
> correctes. La question se repose à chaque valeur arbitraire contenant un
> opérateur.

**Fichiers** : `apps/client/app/root.tsx`, `app/routes/layout.tsx`,
`app/components/bottom-tab-bar.tsx`, `app/routes/q/_index.tsx`. **Flux** : tous.
**Acceptation** : sur iPhone à encoche, la barre d'onglets ne passe plus sous la
barre gestuelle ; aucun décalage introduit sur un appareil sans encoche. **Non
vérifiable en CI** : le critère est visuel, il demande un appareil réel.

#### R2 — Cibles tactiles 44 px sous `lg`

**Objectif** : corriger la taille au niveau du paquet, pas dans 31 fichiers.

1. `packages/ui` : le plancher voyage sur les classes **de base** de `Button` et
   d'`Input`, en `min-h-11 min-w-11 lg:min-h-0 lg:min-w-0`. Les tailles des
   variantes ne bougent pas.
2. `.touch-target` dans `globals.css` : élargit la zone tactile à 44 px **sans
   changer la taille visuelle**, par une surcouche invisible, et se retire
   au-dessus de `lg` pour ne pas manger les clics voisins. Il vit dans
   `@layer components`, non à la fin de la feuille — sinon son
   `position: relative` bat le `absolute` d'un utilitaire Tailwind posé sur le
   même élément.

> **Un plancher est un minimum, jamais une hauteur.** Première tentative :
> `h-11 … lg:h-9` sur les variantes. Elle paraît équivalente et ne l'est pas.
> `tailwind-merge` ne voit aucun conflit entre `lg:h-9` et le `h-13` d'un point
> d'appel — variantes différentes — donc il garde les deux, et **tout champ
> réglé à sa propre hauteur rétrécissait au-dessus de `lg`**. Constaté à l'écran
> sur la connexion : le champ à 36 px à côté de sa pastille `+225` à 52.
> `min-h-11` perd contre toute hauteur plus grande, ce qu'un plancher doit
> faire.

> **La contradiction du §2.1, tranchée.** La ligne « Cible tactile » impose 44
> px « sans exception » ; la ligne « Puce de filtre » impose une capsule de
> **34–38 px**. `.touch-target` les réconcilie : la puce reste dessinée à 34 px,
> sa zone tactile fait 44. Même traitement pour l'œil du mot de passe (24 px, à
> l'intérieur du champ), les onglets, et les liens de texte, dont la boîte
> relève de la typographie et non du contrôle.

> **Recompté (§1.1), et par la mesure plutôt que par `grep`.** Le plan annonçait
> « 31 occurrences de `h-9 w-9`, `size-9`, `size-8` ». Compter ces classes donne
> une centaine de résultats, dont la plupart sont **décoratifs** (pastilles
> d'icônes, avatars) — or le critère porte sur les éléments _interactifs_. Ils
> ont donc été mesurés dans le navigateur, boîte englobante par boîte englobante
> : **27 cibles distinctes** sous 44 px dans le client, **4** dans les pages
> accessibles du backoffice. Le correctif étant porté par le paquet, **aucun
> point d'appel n'a eu besoin d'être converti** : ceux qui l'avaient été pendant
> la première tentative ont été rendus à leur état d'origine.

**Fichiers** : `packages/ui/src/components/ui/{button,input,tabs}.tsx`,
`packages/ui/src/styles/globals.css`, et une douzaine de points d'appel dont la
taille visuelle est délibérément sous le plancher. **Flux** : tous.
**Acceptation** : aucun élément interactif sous 44 px sous `lg` — **mesuré à 0
sur les 13 routes du client et les 3 pages accessibles du backoffice**, contre
27 et 4 au départ. **Tests** : projet `node`, trois cas par variante de `Button`
— le plancher est présent, il se retire au-dessus de `lg`, et **il n'est jamais
exprimé en hauteur**, ce dernier cas gardant la régression décrite plus haut.

> **Non couvert en CI** : la mesure demande un navigateur et l'application
> servie. Le test de variantes garde le paquet ; il ne garde pas un point
> d'appel qui figerait une taille sous le plancher.

#### R3 — Tokens de couleur accessibles

**Objectif** : deux corrections symétriques — le vert en sombre, l'orange en
clair — plus le respect de `prefers-reduced-motion`.

1. `globals.css` : ajouter `--accent-orange-text` (#B35600) et
   `--primary-green-text` ; en `.dark`, câbler ce dernier sur
   `--primary-green-light` (#2A9D54).
2. Remplacer les usages **texte** de `text-accent-orange` et
   `text-primary-green` par les nouveaux tokens. Les **aplats** ne changent pas.
3. Passer toute encre posée sur un aplat orange en `--foreground`.
4. Ajouter un bloc `@media (prefers-reduced-motion: reduce)` global — le dépôt
   n'en contient aujourd'hui aucune occurrence.

**Fichiers** : `packages/ui/src/styles/globals.css`, puis les usages. **Flux** :
tous. **Acceptation** : tout texte atteint 4,5:1 dans les deux thèmes. **Tests**
: projet `node`, un test qui calcule les ratios des couples de tokens et échoue
sous 4,5 — garde de non-régression.

> **Les deux valeurs de §3 ne survivent pas à la mesure.** Elles n'avaient été
> vérifiées que contre `--background`. Contre les autres surfaces réelles :
> #2A9D54 tombe à **4,35** sur `--muted` en sombre, et le motif de pastille
> `bg-primary-green/10 + text-primary-green` — une quinzaine d'appels — tombe à
> **4,41** en clair, `/20` à **3,83** ; côté orange, #B35600 donne **4,48** sur
> `bg-accent-orange/10` et **4,06** sur `/20`. Les tokens retenus tiennent sur
> **toutes** ces surfaces, aplats teintés compris : encre verte **#1A6F3A** en
> clair (4,73 au pire) / **#2FA85B** en sombre (4,94), encre orange **#A85000**
> en clair (4,52) / **#F57C00 inchangé** en sombre (5,59 — l'orange de marque
> n'a jamais eu de problème en sombre, le plan ne le disait pas). §3 est corrigé
> en conséquence.

> **L'encre de l'aplat orange ne peut pas être `--foreground`.** Le point 3
> l'écrivait ainsi ; `--foreground` bascule au quasi-blanc en thème sombre,
> alors que l'aplat, lui, ne bascule pas — le blanc sur orange à 2,70:1 que §2.1
> interdit revenait donc par la porte de derrière. D'où un token dédié,
> `--accent-orange-foreground` (#181B1F), **identique dans les deux thèmes**, et
> un test qui vérifie précisément cette identité.

> **Quatre couples de la palette shadcn échouaient, hors périmètre annoncé.** La
> rampe de marque cachait le reste : `--accent` est ici un **orange saturé** et
> non le neutre de shadcn, donc son encre blanche lisait **3,05** en clair et
> **2,62** en sombre — atteint par chaque `hover:bg-accent` du paquet ;
> `--primary` et `--sidebar-primary`, éclaircis pour le thème sombre, lisaient
> **4,03** sous leur propre blanc. `--primary` s'est révélé être le piège du
> chantier : c'est **à la fois un aplat et une encre** (`text-primary`, 118
> appels). L'assombrir corrigeait l'aplat (4,95) et cassait l'encre (3,99).
> Réglé en séparant les rôles comme partout ailleurs — aplat éclairci à
> `oklch(0.65 0.15 145)` et encre foncée : 4,96 au pire comme encre, 5,67 comme
> aplat. Le test couvre désormais **tous** les couples `--x` / `--x-foreground`.

> **Trois défauts de contraste hors tokens, trouvés au navigateur.** Un texte ne
> se corrige pas toujours dans la feuille de style. (a) Le blanc **fondu** sur
> l'aplat vert : `text-white/60` à `/80` lit 2,85 à 3,83 — sur ce vert, même
> `/90` ne passe pas (4,41), donc le corps de texte reprend le blanc plein (13
> appels ; icônes et logotype gardent leur fondu). (b) `bg-red-500` sous du
> blanc lit **3,81** — passé en `red-600` (4,77) sur les deux pastilles « Perdu
> » ; le point de 2 px à côté n'est pas du texte et ne bouge pas. (c) Le bandeau
> d'appel de l'accueil est un `bg-neutral-900`, **sombre dans les deux thèmes**
> : une encre qui suit le thème y lit 2,38 en clair. Même piège que `bg-white`
> et `bg-green-50` ailleurs — une surface fixe demande une encre fixe, et les
> trois emplacements portent désormais un commentaire qui le dit.

> **Portée réelle : `ui` **et** `client`.** Le tableau §4 annonce `ui` seul, ce
> qui ne pouvait pas tenir dès lors que le point 2 demande de reprendre les
> usages : 78 fichiers de `apps/client`, pour 110 encres vertes et 35 oranges.
> `apps/admin` n'est pas touché — son seul appel est le « CI » du logo.

> **Le logotype garde l'orange de marque.** `text-accent-orange` reste sur le «
> CI » de `logo-retrouveci.tsx`, `mobile-nav.tsx` et l'écran d'auth du
> backoffice, à 2,70:1. WCAG 1.4.3 exempte explicitement les logotypes, et la
> marque ne doit pas changer de teinte selon le thème. Arbitrage de séance.

> **Mesuré, pas compté.** Les 15 routes servies ont été parcourues aux deux
> thèmes et aux deux largeurs (390 et 1280), chaque nœud de texte mesuré contre
> son fond réel — fond composité couche par couche, teintes `/NN`, opacité
> d'ancêtre et dégradés compris. 27 couples distincts sous le seuil au départ,
> **0 à l'arrivée** : le reliquat est du texte décoratif (numéros d'étape en
> `opacity-10`, numérotation de sections), un bouton **désactivé**, et le
> logotype — les trois catégories que 1.4.3 exempte. **Non couvert en CI** : la
> mesure demande un navigateur et l'application servie ; le test garde les
> tokens, pas les points d'appel.

#### R4 — Photos servies à la taille d'affichage

**Objectif** : arrêter de servir l'original Cloudinary dans une vignette.

1. Helper `imageUrl(url, { w })` qui insère `f_auto,q_auto,c_fill,w_…` dans le
   chemin Cloudinary, et rend l'URL inchangée si elle n'en est pas une.
2. Appliquer sur chaque `<img>` d'annonce, avec `loading="lazy"`, `width` et
   `height` déclarés (le décalage de mise en page vient de leur absence).
3. Vérifier le poids d'une grille de douze annonces avant / après.

**Fichiers** : `apps/client/app/shared/utils/image.ts` (nouveau),
`routes/posts/components/listing-card.tsx`,
`routes/account/posts/components/listing-card.tsx`,
`routes/posts/details/components/post-gallery.tsx`,
**`routes/account/components/recent-listings.tsx`** (oublié de la liste
d'origine — c'est la cinquième photo d'annonce du client). **Flux** : A, D.
**Acceptation** : plus aucune URL Cloudinary brute dans un `<img>`. **Tests** :
projet `node` sur le helper (URL Cloudinary et non-Cloudinary), **plus un test
`ui`** qui vérifie que les photos arrivent au DOM par le helper, à la largeur
mesurée — le câblage est invisible au `typecheck`, une URL brute se type
parfaitement.

> **`c_limit`, pas `c_fill`.** Mesuré sur `res.cloudinary.com/demo` : avec une
> largeur et **sans hauteur**, les deux se comportent identiquement, sauf que
> `c_fill` **agrandit**. Sur un original de 864 px, `c_fill,w_3000` renvoie
> **105 588 o** contre **43 278 o** pour `c_limit` — 2,4 fois plus lourd, pour
> une image que personne n'a demandée plus grande. Le recadrage dont les cartes
> ont besoin est celui de CSS (`object-cover`), que ni l'un ni l'autre ne
> change.

> **Pas d'attributs `width` / `height`, contrairement au point 2.** Le décalage
> de mise en page ne vient pas de leur absence ici : les sept `<img>` sont
> `h-full w-full` (la plupart en `absolute inset-0`) dans un conteneur que le
> CSS dimensionne déjà — `h-20 w-20`, `aspect-video`, `aspect-4/3`. La boîte est
> donc réservée avant que la photo n'arrive, et il n'y a pas de décalage à
> corriger. Déclarer une taille intrinsèque que l'on ne connaît pas serait un
> mensonge dont hériterait le premier refactor qui retire `h-full`. À la place :
> `loading="lazy"` et `decoding="async"` partout, et `fetchPriority="high"` sur
> la photo de détail, qui est le LCP de sa page — c'est le seul endroit où
> `lazy` nuirait.

> **Largeurs mesurées, pas devinées.** Boîtes relevées au navigateur de 390 à
> 1920 px : la photo de grille plafonne à **489** px CSS (et non « pleine
> largeur »), celle du détail à **890**, les vignettes sont fixes à 80, 96, 64
> et 56. Chaque appel demande le **double** — des pixels d'appareil, pour un
> écran 2× : 1000, 1600, 160, 192, 128, 112. La visionneuse **réutilise l'URL de
> la photo principale** au lieu d'en demander une plus grande : 1600 px
> d'appareil couvrent déjà une vue à 85 vh, et une seconde largeur voudrait dire
> un second téléchargement d'une photo déjà en cache.

> **Le poids, mesuré sur le réseau.** La base de développement ne contient
> **aucune** photo (7 annonces, 0 image), donc le point 3 a été mesuré contre le
> cloud de démonstration de Cloudinary, sur `dog.jpg` — 3000 × 2000, 537 666 o,
> l'ordre de grandeur d'une photo de téléphone. Une **grille de douze annonces**
> passe de **6,15 Mio à 447 Kio, soit −92,9 %** (38 165 o par carte au lieu de
> 537 666). Le détail : 71 447 o (−86,7 %). Une vignette de liste : 3 252 o
> (−99,4 %). L'essentiel du gain vient de `f_auto` — Cloudinary renvoie de
> l'AVIF — avant même le redimensionnement.

> **Le backoffice porte le même défaut, et n'est pas corrigé ici.**
> `apps/admin/app/routes/dashboard/posts/components/post-photos.tsx` est un
> quasi-jumeau de `post-gallery.tsx` et sert trois URL Cloudinary brutes à un
> modérateur. R4 est scopée `client` et le corriger voudrait dire promouvoir
> `imageUrl` dans `@app/web-kit` — une modification d'API de paquet, qui mérite
> son étape. **À ouvrir**, ce n'est pas un oubli.

### Lot 2 — Coquille

#### R5 — Thème dans Réglages + option `system`

**Objectif** : rendre le thème atteignable sur mobile **avant** que R6 ne
supprime le menu latéral.

1. `theme.server.ts` : accepter une troisième valeur `system`, et en faire le
   défaut quand le cookie est absent — en consultant `prefers-color-scheme`
   plutôt qu'en retombant sur `light`.
2. `ThemeProvider` : `setTheme` accepte les trois valeurs ; `system` retire la
   classe et laisse la média-requête décider.
3. Section « Apparence » dans Réglages : trois aperçus, pas un interrupteur.
4. Laisser `ThemeToggle` en place dans le header desktop.

**Fichiers** : `app/shared/helpers/theme.ts`, `theme.server.ts`,
`app/context/theme.tsx`, **`app/root.tsx`** (le script de tête, voir plus bas),
`app/routes/account/settings/`. **Flux** : tous. **Acceptation** : un appareil
réglé en sombre ouvre l'app en sombre à la première visite, sans flash blanc.
**Tests** : projet `node` sur `getThemePreferenceFromRequest` (cookie absent,
`system`, valeur inconnue, cookie voisin), **plus un projet `ui`** sur la
section Apparence — trois choix, le courant marqué comme tel, un clic qui peint
_et_ persiste.

> **Le point 1 n'est pas réalisable tel qu'écrit.** « En consultant
> `prefers-color-scheme` » côté serveur est impossible : c'est une **requête
> média**, que le serveur n'évalue pas. L'indice client qui la reflète
> (`Sec-CH-Prefers-Color-Scheme`) n'est envoyé qu'**après** qu'une réponse
> précédente l'a demandé — donc jamais sur la première requête, précisément
> celle que le critère vise, et Safari comme Firefox ne l'implémentent pas. Ce
> qui ferme l'écart est un **script classique bloquant en `<head>`**, qui lit le
> cookie et la requête média puis pose la classe avant le premier rendu. Le
> serveur n'envoie donc plus qu'une **préférence** : `light` et `dark` sont
> rendus directement, `system` part neutre (`class=""`,
> `color-scheme: light dark`) et le script tranche.

> **Mesuré image par image, pas supposé.** Le premier rendu a été capturé en
> `Page.startScreencast` (CDP) sur les cinq combinaisons cookie × appareil.
> Premier passage, appareil sombre, aucun cookie : **0 image claire sur 88**.
> L'A/B qui le prouve : le même cas **JavaScript désactivé**, où le script ne
> peut plus agir, donne **57 images claires sur 58**. Le script est donc bien ce
> qui supprime le flash, et le critère est vérifié par la mesure.

> **Limite connue, assumée.** Sans JavaScript et en préférence `system`, un
> appareil sombre ouvre en clair. Un choix explicite, lui, reste servi par le
> SSR et fonctionne sans JS. La fermer demanderait un bloc
> `@media (prefers-color-scheme: dark)` dans `globals.css` — mais la variante
> `dark:` du paquet est `&:is(.dark *)`, donc seules les valeurs de tokens
> basculeraient et pas les utilitaires `dark:` des composants : un demi-état
> pire que le manque. Hors périmètre de R5 (`client/account`), à rouvrir avec
> `packages/ui`.

> **`theme` veut dire deux choses, et le code les sépare maintenant.**
> `ThemePreference` (`light | dark | system`) est ce que la personne a choisi ;
> `Theme` (`light | dark`) est ce qui est peint. Le contexte expose les deux, ce
> qui laisse `ThemeToggle` et `MobileNav` **inchangés** — ils lisent `theme` et
> `toggleTheme`, dont le sens n'a pas bougé. Depuis `system`, la bascule
> s'engage sur l'inverse de ce qui est à l'écran, ce que demande quelqu'un qui
> clique un soleil ou une lune.

> **Écarts à la planche `Reglages`.** Trois, tous consignés plutôt que subis.
> (a) Les aperçus sont repris **au pixel** — 62 px, la grille à trois colonnes,
> la page miniature avec sa barre de titre, ses deux lignes et son bouton vert,
> et l'aperçu `Système` **coupé en deux**. Ils sont peints en **couleurs fixes**
> et non en tokens : l'aperçu « Clair » doit rester clair quand l'application
> est sombre, exactement la leçon de R3 sur les surfaces fixes. (b) La planche
> dessine la section en `.sec` nue avec un `h2`, là où la page Réglages actuelle
> encadre chaque section (`bg-background rounded-2xl border` + en-tête
> `bg-muted/30`). La section adopte **la coquille de la page existante** : R5
> ajoute un bloc, elle ne redessine pas l'écran. (c) La légende de la planche
> dit « C'est le nouveau défaut » ; la mention est datée le jour où elle est
> livrée, et la version sombre y ajoute une phrase qui s'adresse au lecteur de
> la maquette, pas à l'utilisateur. Gardée : « « Système » suit le réglage de
> votre téléphone. »

> **Ordre de la page.** La planche place Apparence **en tête** de Réglages, et
> c'est ce qui est fait. Elle place ensuite Alertes avant Vos informations, là
> où la page garde Informations avant Notifications — non touché : R5 ajoute une
> section, réordonner le reste n'est l'objet d'aucune étape.

> **Le contrôle est un `<input type="radio">` masqué**, pas un bouton stylé : il
> apporte la navigation aux flèches, la sémantique de groupe et l'annonce au
> lecteur d'écran, qu'un bouton devrait chacune reconstruire. `RadioGroupItem`
> du paquet dessine une pastille et ne convenait pas — la maquette fait de la
> **carte entière** le contrôle.

#### R6 — Barre d'onglets à 4 entrées + Scanner

**Objectif** : poser la coquille définitive. **Seule étape à portée globale.**

1. `BottomTabBar` : Accueil · Annonces · (+) · Scanner · Compte. L'onglet
   Scanner porte une pastille pleine — il se lit comme une action.
2. Supprimer `MobileNav` et le bouton burger ; déplacer les liens légaux au pied
   de page.
3. Fusionner `ActivityHub` dans l'écran Compte (résumé en tête), supprimer la
   bulle flottante.
4. Retirer l'icône scanner des en-têtes : l'onglet la rend redondante.
5. Bascule `md:hidden` → `lg:hidden` sur la barre, et `hidden md:*` →
   `hidden lg:*` sur les éléments d'en-tête concernés.
6. Pied de page réduit à trois liens sur les écrans applicatifs.

**Fichiers** : `app/components/bottom-tab-bar.tsx`, `mobile-nav.tsx` (supprimé),
`activity-hub.tsx`, `header.tsx`, `footer.tsx`, `app/routes/layout.tsx`.
**Flux** : tous. **Acceptation** : aucune route n'a perdu d'accès ; le thème
reste atteignable (R5) ; les notifications restent atteignables par la cloche.
**Tests** : projet `ui` — chaque onglet mène à sa route, l'état actif suit
l'URL.

> **Point à surveiller.** L'onglet Stickers disparaît : l'acquisition repose
> entièrement sur le bloc produit de l'accueil (R17). Si ce bloc ne convertit
> pas, c'est lui qu'il faut reprendre — pas la barre.

> **`/scan` n'existait pas, et R20 en dépend.** C'est R20 qui crée
> `routes/scan/`, et R20 **dépend de R6** : posée telle quelle, la barre aurait
> mené à `route('*')`. R6 ouvre donc une route `/scan` **minimale** — la saisie
> du code, qui envoie sur `/q/:code`. Ce n'est pas un bouche-trou : §3 la
> désigne comme l'équivalent desktop d'un scan, et R21.3 la garde comme repli
> universel. **R20 remplace l'écran** par la caméra et son amorce de permission
> ; la saisie reste.

> **Le point 4 est sans objet.** Aucun en-tête ne porte d'icône scanner — ni
> `header.tsx`, ni nulle part ailleurs dans `app/components`. Comme R30, cette
> partie se clôt sans travail propre.

> **Le point 2 était déjà à moitié fait.** Les quatre liens légaux (`/about`,
> `/contact`, `/terms`, `/privacy`) sont dans le pied de page depuis toujours,
> et le pied de page est rendu sur tous les écrans applicatifs. Seule la
> suppression du burger était du travail réel.

> **Le point 6 dit trois liens ; il en part quatre.** Une fois le burger
> supprimé, ces quatre-là sont **chacun le seul chemin** vers leur route sur un
> téléphone. En retirer un ferait échouer le critère d'acceptation de cette
> étape même — « aucune route n'a perdu d'accès ». Le critère l'emporte sur le
> compte.

> **La cloche devait bouger, et c'est le vrai risque de l'étape.** Le critère
> dit « les notifications restent atteignables par la cloche » — mais la cloche
> était `hidden md:flex`, donc sur un téléphone les notifications n'étaient
> atteignables que par l'onglet « Alertes », celui que cette étape supprime.
> Exactement le piège déjà payé deux fois sur le logo des écrans d'auth : _ce
> qui est masqué sous un point de rupture disparaît pour de bon_. La cloche est
> désormais rendue à **toutes** les largeurs, en **une seule instance** — elle
> sonde `/notifications` toutes les 60 s, une seconde doublerait le trafic. Un
> test la garde à 390, 768 et 1280.

> **`/notifications` est délibérément perdu pour un visiteur anonyme**, et c'est
> un correctif : le loader appelle `requireServerSession`, donc l'ancien onglet
> « Alertes » offrait à un visiteur non connecté un lien vers une redirection.

> **La bulle d'activité change de source, pas seulement de place.** Elle lisait
> une route-ressource `account/activity` en `fetcher.load`, précisément pour ne
> pas coûter un aller-retour de session à chaque navigation depuis le loader
> racine. L'écran Compte, lui, **a déjà un loader et exige déjà une session** :
> le résumé voyage avec, et l'appel côté client disparaît. `activity.loader.ts`
> devient `activity.service.ts`, l'entrée de `routes.ts` est retirée, et
> `use-activity-summary.ts` est supprimé. Il ne reste **aucun composant du
> client qui appelle l'API** — le jumeau de la règle déjà tenue par `admin`.

> **Recouvrement assumé avec `AccountStats`.** Les trois tuiles de la planche
> comptent « annonces en ligne », ce que `AccountStats` affiche déjà en «
> Annonces actives ». La planche `Compte` n'a pas d'équivalent d'`AccountStats`
> — elle le remplace. Réconcilier les deux blocs est une refonte de l'écran
> Compte, dont aucune étape du plan ne porte le nom. **À ouvrir.**

> **Pas d'icône de recherche.** `NavC` dessine une loupe à côté de la cloche
> dans le bandeau mobile. R6 n'en parle pas et la recherche a sa propre barre
> sur `/posts` : non ajoutée.

> **Mesuré, pas raisonné.** Les liens internes **visibles** ont été collectés à
> 390 et 1280 px sur huit routes, burger ouvert compris, avant et après. À 390
> px, avant : les onze liens du menu étaient **tous** déjà atteignables
> ailleurs. Après : l'ensemble est identique **moins** `/notifications` (le
> correctif ci-dessus, visiteur anonyme) et **plus** `/scan`. À 1280 px :
> inchangé. La géométrie a été relevée aux trois largeurs — la barre est
> présente à 390 et 768, absente à 1280 ; le pied de page compact l'inverse.

**Portée réelle** : ajoute `app/root.tsx`, `app/routes.ts`, `app/routes/scan/`
(nouveau) et `app/routes/account/`. `pnpm build` est obligatoire ici,
`routes.ts` résolvant ses modules par chaîne de caractères.

#### R7 — En-tête desktop en trois zones

**Objectif** : donner l'espace libre à la recherche, qui manquait par ailleurs.

1. Remplacer `justify-between` par trois zones : identité + liens à gauche,
   recherche `flex: 1` avec `max-width` au centre, actions à droite.
2. Remplacer le menu déroulant « Publier » par un bouton scindé « J'ai perdu » /
   « J'ai trouvé » — même libellé que le hero (§2.3, règle 3).
3. Faire servir l'écouteur de défilement existant : 76 → 58 px, les liens
   s'effacent, la recherche reste.
4. Entre 768 et 1023 px : en-tête réduit à logo + recherche + cloche, la
   navigation restant dans la barre d'onglets.

**Fichiers** : `app/components/header.tsx`, `app/components/search-bar.tsx`.
**Flux** : tous. **Acceptation** : composition stable de 1024 à 1920 px ; la
recherche est atteignable depuis n'importe quelle page. **Tests** : projet `ui`
— où la recherche envoie, et que « J'ai perdu » / « J'ai trouvé » sont **deux
liens** et non un menu ; ni l'un ni l'autre n'est visible au `typecheck`.

> **La mesure a imposé un arbitrage que le plan ne prévoyait pas.** Première
> version posée telle qu'écrite : à **1024 px la recherche tombait à 208 px** au
> repos, et bondissait à 382 une fois défilée — le logo, les liens, la bascule
> de thème et le bouton scindé consommaient tout. Ce n'est pas une « composition
> stable de 1024 à 1920 ». Trois corrections : la bascule de thème passe à `xl`,
> les espacements se resserrent entre `lg` et `xl`, et la zone centrale reçoit
> un **plancher** (`lg:min-w-80`). Mesuré après : **340 px à 1024**, 464 à 1280,
> 620 (le plafond) à 1440 et 1920, les trois zones présentes à chaque largeur.

> **La bascule de thème n'apparaît qu'à 1280**, là où R5 demandait de la laisser
> « dans l'en-tête desktop ». C'est elle qui cède parce que **R5 a précisément
> donné au thème un domicile durable dans Réglages**, alors que les liens sont
> la seule navigation qui reste au-dessus de `lg` — la barre d'onglets est
> `lg:hidden`. Elle est toujours là de 1280 à 1920.

> **Pas de sélecteur de ville dans la recherche.** La planche `NavDesktop`
> dessine une puce « Abidjan ▾ » dans le champ. C'est un **filtre**, et les
> filtres sont l'objet de R8. Non ajouté.

> **Le bouton scindé ne se replie pas au défilement**, là où la planche le
> remplace par une pastille « Publier » unique. Le point 3 énumère ce qui change
> — « les liens s'effacent, la recherche reste » — et le bouton tient dans les
> 58 px. Surtout, §2.3 règle 3 demande **ces deux libellés-là** partout où ils
> paraissent ; les remplacer par un mot générique à mi-page les affaiblirait.

> **« Accueil » quitte les liens**, comme sur la planche : la marque y mène
> déjà, et un lien qui répète le logo posé à côté dépense un emplacement pour
> rien. Aucune route perdue. La pastille grise à trois onglets devient deux
> liens soulignés à l'actif, également d'après la planche.

> **Sous 768 px, l'en-tête ne porte toujours pas de recherche.** Les quatre
> points de R7 sont tous ≥ 768, et la planche `NavC` dessine bien une loupe dans
> le bandeau mobile — mais il lui faut une destination (un écran de recherche,
> ou un champ qui se déploie) qu'aucune étape ne spécifie. Sur un téléphone la
> recherche reste à un geste : l'onglet Annonces, qui ouvre `/posts` et sa
> propre barre. **À ouvrir** avec R8.

> **`SearchBar` gagne `submit: 'label' | 'icon' | 'none'`**, qui remplace
> `showSubmit` — un booléen qu'aucun point d'appel n'utilisait. L'en-tête prend
> `icon` : à 1024 px un bouton libellé mangerait la largeur que la recherche
> vient de gagner.

> **Un défaut de R3 trouvé ici, et corrigé ici.** Signalé sur capture par le
> commanditaire : le bouton « Connexion » devenait un pavé **noir sur noir** au
> survol en thème sombre. Mesuré : **1,01:1**. La cause n'est pas dans les
> tokens mais dans une paire disloquée du paquet — `Button` remplace son fond de
> survol pour le thème sombre (`dark:hover:bg-input/50`) **sans** remplacer
> l'encre qui va avec (`hover:text-accent-foreground`). Or R3 a passé
> `--accent-foreground` en encre foncée, ce qui est juste sur l'aplat orange et
> illisible sur ce gris. `ghost` avait le même défaut, à 2,27. Réparé en nommant
> l'encre à côté du fond (`dark:hover:text-foreground`) : 16,34 et 7,29. Le
> garde de R3 couvre désormais la **règle** — une variante qui renomme son fond
> de survol en sombre doit y nommer son encre — et il a été vérifié qu'il mord.

> **Mesuré aux six largeurs**, au repos et défilé : 390, 768, 1024, 1280, 1440
> et 1920. Et la seconde moitié du critère vérifiée pour de bon — la recherche
> soumise depuis `/`, `/about`, `/stickers` et `/contact` atterrit bien sur
> `/posts?q=…`, la requête préservée.

### Lot 3 — Annonces publiques

#### R8 — Filtres en feuille inférieure

1. Sortir `FilterPanel` du flux et le monter dans un `Drawer` (`vaul`, déjà
   installé).
2. Couvrir les cinq filtres, plus un bouton « Voir N résultats » qui ferme.
3. Corriger l'accessibilité au passage : `htmlFor` sur les libellés, et sortir
   la croix de suppression de date du bouton qui la contient (élément interactif
   imbriqué).

**Fichiers** : `routes/posts/components/filter-panel.tsx`,
`routes/posts/_index.tsx`. **Flux** : A. **Acceptation** : les résultats ne sont
jamais repoussés hors écran ; les filtres restent dans l'URL.

> **Le panneau ne couvrait que trois filtres sur cinq**, pas cinq : `ville`,
> `commune` et `période`. Le type et la catégorie vivaient sur la page. Le point
> 2 est donc une extension réelle — la feuille gagne « Type d'annonce » et «
> Catégorie » — et non un déplacement. Les deux défauts du point 3 sont
> confirmés : **trois** libellés sans `htmlFor`, **une** croix interactive
> imbriquée dans le `PopoverTrigger` de la période.

> **`FilterPanel` devient `FilterSheet`.** « Panel » est précisément ce qui
> n'est plus vrai. Le fichier est renommé, et `components/filter-pill.tsx` sort
> la capsule que la page et la feuille dessinaient toutes les deux.

> **La croix imbriquée est supprimée, pas contournée.** La planche `Filtres`
> dessine la période en quatre capsules — « 7 jours », « 30 jours », « Tout », «
> Dates… » — et « Tout » **est** l'effacement. Il n'y a plus de bouton dans un
> bouton parce qu'il n'y a plus de croix. `helpers/date-presets.ts` reconnaît et
> écrit les bornes **dans l'espace de chaînes de l'URL** (`yyyy-MM-dd`), jamais
> via un `Date` : `new Date('2026-08-24')` est minuit UTC, que `format()` rend
> comme la veille à l'ouest de Greenwich, et la capsule cesserait de reconnaître
> la borne qu'elle vient d'écrire.

> **Les filtres s'appliquent en direct, donc « Annuler » restaure un
> instantané.** « Voir N résultats » ne peut pas compter un filtre qui n'a pas
> encore tourné : la feuille écrit dans l'URL à chaque geste. `openFilterSheet`
> mémorise donc la chaîne de recherche à l'ouverture, et « Annuler » la remet.
> Fermer autrement — glissement, superposition, `Échap` — conserve les choix,
> comme le fait une feuille inférieure. Vérifié au navigateur : `?type=found` →
> « Perdus » → « Annuler » redonne `?type=found`.

> **Une seule portée, un seul mot.** Le badge et les pastilles couvrent les
> **trois** filtres sans commande permanente sur la page (ville, commune,
> période) — c'est ce que dessine la planche `Annonces`, badge « 2 » pour «
> Abidjan » et « 7 derniers jours ». Compter le type et la catégorie enverrait
> chercher dans la feuille ce qui est déjà à l'écran. « Réinitialiser », lui,
> vide la **feuille** : les cinq groupes. Le lien à côté des pastilles disait «
> Tout effacer » ; il dit « Réinitialiser », le même mot pour la même action
> (§2.3, règle 3).

> **Le type d'annonce quitte `Tabs` pour la capsule de filtre.** Un `TabsList` à
> côté d'une rangée de capsules, c'était deux formes pour un même rôle (§2.1),
> et `TabsContent` n'enveloppait qu'une liste toujours rendue. La planche
> `Annonces` dessine bien les deux rangées dans le même vocabulaire.

> **Un bouton sans nom accessible, trouvé à la mesure.** Sous `sm`, le mot «
> Filtres » du déclencheur est `hidden` : Playwright ne trouvait aucun bouton de
> ce nom à 390 px, parce qu'il n'en avait aucun. `aria-label` ajouté.

> **Au-dessus de `lg`, la feuille cesse de traverser la fenêtre.** Mesuré à 1280
> px : « Annuler » s'étirait à 484 px, ce qui se lit comme un mur et non comme
> le panneau de §2.1. Plafond `lg:max-w-2xl` centré — 672 px, barre à 250 / 378.
> En dessous, pleine largeur : c'est le téléphone et la tablette que la planche
> dessine.

> **Mesuré, pas raisonné.** Aux trois largeurs (390, 768, 1280) et dans les deux
> thèmes : le haut du compteur de résultats vaut **626 / 532 / 536 px avant
> l'ouverture et exactement les mêmes après** — le critère d'acceptation, relevé
> plutôt qu'affirmé. Aucun débordement horizontal. Les capsules sont dessinées à
> 38 px avec une cible de 44 px sous `lg` (§2.1). Dix paires encre/fond de la
> feuille passent 4,5:1 dans les deux thèmes, la plus basse à 5,03 (« Voir N
> résultats »). Le `Select` de Radix dans le `Drawer` de vaul a été vérifié au
> navigateur : choisir une ville ne referme pas la feuille.

> **Une bascule de test, pas de contournement.** La suite `ui` échouait une fois
> sur deux au niveau de la racine, jamais seule : Playwright refuse de cliquer
> un élément dont la boîte bouge encore, et la transition d'ouverture de la
> feuille survit au délai du clic dès que les deux suites navigateur tournent
> côte à côte. `stopAnimations()` rejoint `shared/helpers/testing.ts` et coupe
> transitions et animations dans le document de test. Deux exécutions complètes
> de la chaîne, vertes.

> **Les deux dettes que R7 a léguées sont tranchées, toutes les deux par la
> négative — avec une troisième ouverte à la place.**
>
> 1. **Pas de puce de ville dans la recherche de l'en-tête.** La planche
>    `NavDesktop` la dessine, mais l'en-tête est posé sur **toutes** les routes,
>    où une ville ne resserre aucune liste. Le filtre a désormais son groupe «
>    Ville » dans la feuille et sa pastille sur `/posts` ; lui donner un second
>    domicile ferait deux sources pour un état.
> 2. **Pas de loupe dans l'en-tête mobile.** `NavC` en dessine une, mais la
>    destination qui lui manquait est `/posts` — que l'onglet « Annonces » ouvre
>    déjà, et dont la planche `Annonces` place la recherche en tête de page, pas
>    dans l'en-tête. Une loupe à côté de cet onglet serait une seconde porte
>    vers la même pièce, et la navigation mobile appartient à la barre d'onglets
>    (§2.1).
> 3. **À ouvrir : le hero de `/posts`.** Ce qui repousse vraiment la recherche
>    sur un téléphone, ce n'est pas l'absence de loupe, c'est `PostsHero` :
>    mesuré à 390 px, le champ arrive à ~340 px et le compteur de résultats à
>    626 px. La planche `Annonces` ne dessine **aucun** hero — en-tête, puis
>    recherche et filtres, puis les cartes. Aucune étape du plan ne porte ce nom
>    (R16 et R32 sont les hero de l'accueil et des stickers), et le remplacer
>    demande de décider ce qui tient sa place au-dessus de `md`, ce que la
>    maquette ne dit pas. **Hors du périmètre de R8**, dont le critère est tenu
>    et mesuré.

**Portée réelle** : ajoute `routes/posts/posts.const.ts`,
`routes/posts/components/filter-pill.tsx`,
`routes/posts/helpers/date-presets.ts`,
`routes/posts/hooks/use-posts-filters.ts` et `shared/helpers/testing.ts`.
`routes.ts` ne bouge pas : pas de `build` obligatoire.

#### R9 — Pagination compacte

1. Remplacer le bouton-par-page de `ListingsContent`
   (`Array.from({ length: totalPages })`) par « 1 … 7 8 9 … 40 », ou par un
   chargement continu — voir §8.
2. Vérifier l'absence de débordement horizontal à 360 px.

**Fichiers** : `routes/posts/components/listings-content.tsx`. **Flux** : A.
**Acceptation** : aucun débordement quel que soit le nombre de pages.

> **La maquette et le plan se contredisaient ; le commanditaire a tranché pour
> la pagination.** La note de décision de la planche `Annonces` dit « la
> pagination à un bouton par page est remplacée par un **chargement continu** »,
> et l'artboard dessine un squelette à 45 % suivi de « Chargement des annonces
> suivantes… ». §8 laissait le choix ouvert en notant ce que la pagination seule
> garde : une position partageable dans l'URL. C'est cet argument qui l'a
> emporté. **Écart assumé vis-à-vis de la maquette**, le premier du chantier :
> la planche `Annonces` et `AnnoncesSombre` ne décrivent plus le bas de cet
> écran, et `MesAnnonces` (R11–R14) dessine le même chargement continu — la même
> question se reposera là, avec la même réponse par défaut.

> **`packages/ui/pagination.tsx` a été évalué et écarté**, pour trois raisons
> mesurées et non par goût : ses libellés `Previous`, `Next`, `More pages` et
> `Go to previous page` sont écrits **en dur comme enfants JSX**, donc
> inatteignables par `props.children`, dans une interface entièrement en
> français ; `PaginationLink` est un `<a>` **sans `href`**, ni focalisable ni
> bouton, là où la barre appelle un rappel qui écrit `page` dans l'URL avec
> `replace` et `preventScrollReset` ; et ses cibles sont à `size-9`, 36 px, sous
> le plancher de 44 px de §2.1. Y ajouter du français ferait dériver le
> composant partagé de sa révision shadcn, ce que la dette de `FieldError`
> documente déjà comme un piège.

> **Une seule liste de créneaux, deux fenêtres.** `helpers/page-window.ts`
> expose `buildPageWindow(page, total, span)` — la primitive, `span` étant le
> nombre de voisins — et `buildResponsiveWindow`, qui fusionne les deux fenêtres
> en une liste où chaque créneau porte les points de rupture qui l'affichent :
> `1 … 8 … 40` sous `sm`, `1 … 7 8 9 … 40` au-dessus. Deux `<ul>` auraient été
> plus simples à écrire et mettaient **deux boutons « Page 8 »** dans le
> document, dont un caché — un lecteur d'écran trouve les deux. Et c'est CSS qui
> choisit, jamais `matchMedia` : lu en JavaScript, le serveur rendrait la
> mauvaise fenêtre et la bonne apparaîtrait en sautant à l'hydratation. Une
> ellipse appartient parfois à une seule vue — à la page 3, le mobile a besoin
> d'un trou entre 1 et 3 là où le bureau affiche `2` — donc chaque créneau de
> trou porte `mobile` et `desktop` séparément. Le test compare les deux vues à
> `buildPageWindow` pour **chaque page de chaque total de 1 à 60**.

> **44 px de cible pour 40 px de dessin — §2.1 ne peut pas être pris au mot
> ici.** Cinq numéros et deux flèches à 44 px de large demandent 388 px, quand
> le conteneur en offre 328 à 360 px. Les boutons sont donc dessinés à `size-10`
> avec `.touch-target`, l'utilitaire posé par R3 pour exactement ce cas : mesuré
> au navigateur, la cible fait **44 × 44 partout sous `lg`** et le recouvrement
> pire cas entre deux zones voisines vaut **0 px** — les débords de 2 px se
> rejoignent au milieu de chaque écart de 4 px sans jamais se chevaucher.

> **Mesuré, pas raisonné.** Un stub d'API a gonflé `total` à 480 (40 pages) sans
> rien écrire en base — la table n'en contient que 7. À 360, 390, 768, 1023 et
> 1280 px, dans les **deux thèmes**, aux pages 1, 3, 8, 38 et 40 :
> `document.scrollWidth` égale exactement la largeur de la fenêtre, le
> débordement propre de la barre vaut 0, et la barre tient dans `16 → 344` à 360
> px. Le pire cas mobile n'est pas la fenêtre à trous mais la liste **complète**
> (≤ 5 pages, donc 7 cibles) : **304 px pour 328 disponibles**. Les fenêtres
> relevées sont celles attendues, `1 … 8 … 40` sous `sm` et `1 … 7 8 9 … 40`
> au-dessus. Neuf paires encre/fond passent 4,5:1 dans les deux thèmes, la plus
> basse à **5,03** (blanc sur `--primary-green`, la même paire que « Voir N
> résultats » de R8).

> **Une fausse mesure attrapée en la refaisant.** L'ellipse était à
> `text-muted-foreground/60`. Lue sans composition alpha elle annonçait 5,94:1 ;
> composée sur son fond réel elle valait **2,56:1 en clair**, sous le seuil de
> 3:1 des éléments non textuels. `aria-hidden` la dispense formellement, mais
> c'est le glyphe qui dit « il y a des pages entre ces deux nombres ». L'opacité
> est retirée : 5,96 en clair, 7,67 en sombre. **Le piège d'`oklch` a un
> jumeau** : lire une encre translucide à pleine opacité fabrique un faux
> positif exactement comme un parseur `rgb`-seul fabriquait des faux négatifs.

> **À 320 px, la page débordait déjà — pas la barre.** `document.scrollWidth`
> vaut 345 pour 320 de fenêtre, et les coupables relevés sont les cercles
> décoratifs de `PostsHero` (`-right-40`) et le rail de catégories, tous deux
> antérieurs ; la barre, elle, tient dans `8 → 312`. R9 ne le corrige pas : son
> critère est 360 px, et la dette du hero de `/posts` (ouverte par R8) couvre le
> premier.

> **La bascule grille/liste est traitée ici, faute d'étape qui la porte.** La
> même note de la planche `Annonces` ajoute « une seule densité de carte sur
> mobile : la bascule grille/liste ne veut rien dire sur une colonne », et
> aucune étape du plan ne la nomme. Sous `sm` la grille **est** une colonne —
> `grid sm:grid-cols-2 lg:grid-cols-3` — donc le contrôle y choisissait entre
> deux densités et non entre deux mises en page. Il passe en `hidden sm:flex`,
> et le défaut de `viewMode` passe de `grid` à `list` : c'est la densité que la
> planche dessine (vignette carrée de 92 px, rangée `flex`), et c'est aussi la
> moins chère — 160 px de photo contre 1000 px pour une carte de grille, l'écart
> que R4 avait déjà mesuré. Un seul DOM par densité, donc pas de `srcset` à
> inventer. Aucun artboard ne dessine `/posts` au-dessus de 390 px, donc aucun
> rendu de référence n'est contredit au-dessus de `sm`, où la grille photo reste
> à un geste.

**Portée réelle** : ajoute `routes/posts/helpers/page-window.ts` et
`routes/posts/components/pagination-bar.tsx`, et touche
`routes/posts/hooks/use-posts-filters.ts` et `routes/posts/_index.tsx` pour la
densité. `routes.ts` ne bouge pas : pas de `build` obligatoire. La barre reste
locale à `routes/posts/` ; R11–R14 la remonteront dans `app/components/` si «
Mes annonces » en veut une.

#### R10 — Barre d'action basse sur le détail

1. `ContactCard` devient une barre collée en bas : « Contacter par WhatsApp »
   dominante, partage en secondaire.
2. Galerie plein cadre en tête, avec indicateurs de position.
3. Conserver l'encadré de sécurité (« ne versez jamais d'argent… ») dans le
   flux, sous la description.

> **Le bouton de contact ne contactait personne.** « Envoyer un message »
> n'avait pas de gestionnaire, et la carte annonçait sous lui « tout contact se
> fait via notre messagerie sécurisée » — une messagerie qui n'existe pas, à
> côté du numéro du posteur affiché en clair deux lignes plus bas, précédé de «
> Contact préféré : ». R10 branche l'action sur `wa.me` et retire la phrase. Le
> champ que le mappeur appelait `contact.method` est un numéro, pas un moyen :
> il devient `contact.whatsapp`.
>
> **Un numéro sur trois formes, et une quatrième qui n'en est pas une.**
> `buildWhatsAppContactUrl` accepte l'E.164 que le contrat écrit désormais, le
> numéro local nu et l'un ou l'autre espacé, et répond **`null`** au reste —
> dont le `+2252250700000000` que `CLAUDE.md` donne comme réellement stocké. Un
> `wa.me` construit sur dix mauvais chiffres ouvre WhatsApp sur « ce numéro
> n'est pas sur WhatsApp », ce qui se lit comme une panne de l'application ; la
> barre dit « Numéro de contact indisponible » à la place. C'est le quatrième
> état de §2.3 règle 5, pas une précaution.

> **Une colonne unique à toutes les largeurs, et le rail de bureau disparaît.**
> Le plan dit « `ContactCard` devient une barre collée en bas » sans nommer de
> point de rupture, et aucun artboard ne dessine cet écran au-dessus de 390 px.
> Or les trois blocs que le rail portait s'en vont ailleurs : le posteur et
> l'encadré de sécurité descendent dans le flux (point 3), l'action monte dans
> la barre. Le rail resterait avec rien. La page devient donc **une colonne
> `max-w-2xl` centrée**, la barre collée au bas de cette colonne — mesurée
> visible sans défilement à 320, 360, 390, 768, 1023 et 1280 px, y compris sur
> un écran de **500 px de haut**.
>
> La barre est `sticky` et non `fixed` : elle ne coûte aucune bande permanente
> de fenêtre, se décroche à la fin de l'article et s'y repose au-dessus du pied
> de page. Son décalage bas vaut `4rem + env(safe-area-inset-bottom)`, soit la
> hauteur exacte de la barre d'onglets, dont elle recouvre le filet de 1 px —
> volontairement, sinon les deux bordures dessinent un double trait.

> **Les indicateurs de position ne sont pas des boutons.** Écrits d'abord en
> `<button>` avec `.touch-target`, ils étaient **inatteignables** : trois cibles
> de 44 px espacées de 16 se recouvrent de 28 px, et la dernière remporte chaque
> tap — Playwright a refusé de cliquer la deuxième pendant vingt secondes en
> nommant la troisième. C'est le recouvrement que R2 et R9 avaient mesuré à 0 px
> ailleurs. La maquette les dessine en `<span>` ; ils redeviennent des `<span>`
> `aria-hidden`, et la navigation reste entière : la piste est un **scroll-snap
> horizontal**, donc le geste natif du téléphone, et chaque photo est un bouton
> nommé (« Agrandir la photo N ») accessible au clavier. Mesuré : l'indicateur
> suit le geste (20/6/6 → 6/20/6 → 6/6/20) et la flèche de la visionneuse ramène
> la piste avec elle, si bien qu'on ressort sur la photo qu'on regardait.
>
> Les diapositives après la première portent `loading="lazy"` : elles sont hors
> fenêtre **horizontalement**, ce que `lazy` diffère, sinon une annonce à cinq
> photos en téléchargerait cinq de 1600 px pour en montrer une.

> **« Signaler » est mis en commentaire, pas supprimé.** C'était un
> `variant="ghost"` sans gestionnaire, et l'API n'a **aucun** point d'entrée de
> signalement : le bouton promettait un chemin de modération inexistant. Il
> revient le jour où il en existe un.
>
> **Le partage n'est dessiné qu'une fois.** L'artboard le montre deux fois — en
> pastille flottante sur la photo **et** en action secondaire de la barre. §5 ne
> nomme que la seconde ; la flottante est retirée, et le coin haut gauche de la
> photo garde le seul disque, celui du retour. Le lien texte « Retour aux
> annonces » disparaît au profit de ce disque, à toutes les largeurs : mesuré,
> il remporte bien le tap sur le bouton de photo qu'il recouvre.

> **Mesuré dans les deux thèmes.** Aux six largeurs et sur un écran de 500 px de
> haut, `document.scrollWidth` égale exactement la largeur de fenêtre — **y
> compris à 320 px**, où `/posts` débordait encore (345 pour 320) : cet écran
> n'a pas de hero. Aucune cible sous 44 px sous `lg`, et le pire recouvrement
> entre deux zones est le disque de retour sur sa photo, qui est voulu. Encre la
> plus basse : **4,97** en clair (l'encadré de sécurité, `--accent-orange-text`
> sur `bg-accent-orange/10`) et **5,87** en sombre ; le bouton dominant vaut
> **5,03** dans les deux, la même paire que « Voir N résultats » de R8 et que la
> pagination de R9. Le **2,70:1** relevé sur le « CI » du logo est antérieur et
> sur toutes les pages — dette, pas régression.

> **Trois tables de catégories, dont une non typée.** `posts.const.ts` nommait
> les catégories au pluriel pour les filtres, `components/listing-card.tsx` au
> singulier dans un `Record<string, string>` avec deux `??`, et le détail
> n'affichait **rien du tout** : il rendait `listing.category` brut, donc «
> phone » à un lecteur francophone. Une seule table typée
> `Record<LostItemCategory, …>` porte les deux formes, et `categoryLabel` /
> `categoryIcon` la lisent — une catégorie ajoutée au contrat redevient une
> erreur de compilation. La pastille « Perdu » passe de `text-red-600` à
> `text-red-700` **des deux côtés** : à 10 px gras, 4,6 était juste, 5,87 ne
> l'est plus, et l'invariant du flux A veut la même pastille sur les deux
> écrans.

**Portée réelle** : `contact-card.tsx` devient `contact-bar.tsx` ; s'ajoutent
`helpers/contact-links.ts` et deux suites de tests. Touche aussi
`components/post-content.tsx` (composition de l'artboard),
`components/share-menu.tsx` (déclencheur en icône seule), `posts.const.ts` et
`components/listing-card.tsx` (table de catégories), et le couple
`shared/types/lost-items.types.ts` / `shared/mappers/lost-item.mapper.ts` pour
le renommage du champ. `routes.ts` ne bouge pas : pas de `build` obligatoire.

**Fichiers** : `routes/posts/details/_index.tsx`, `components/contact-card.tsx`,
`components/post-gallery.tsx`. **Flux** : A, B. **Acceptation** : l'action de
contact est visible sans défilement, à toute hauteur d'écran.

### Lot 4 — Compte

#### R11 — Filtres de Mes annonces pilotés par l'URL

**Objectif** : aligner `/account/posts` sur `/posts`, et cesser de perdre la 51ᵉ
annonce.

1. Supprimer `?pageSize=50` en dur et le filtrage `useMemo` côté client.
2. Porter recherche, statut et page dans l'URL ; le loader appelle l'API avec.
3. Reprendre le motif de `usePostsFilters` : `setSearchParams` avec `replace` et
   `preventScrollReset`, recherche débattue.

**Fichiers** : `routes/account/posts/servers/account-posts.service.ts`,
`account-posts.loader.ts`, `routes/account/posts/_index.tsx`, nouveau
`hooks/use-account-posts-filters.ts`. **Flux** : D. **Acceptation** : un
utilisateur à 60 annonces les voit toutes ; l'état de filtre survit à un retour
arrière. **Tests** : projet `node` sur le parseur de filtres.

> **Le statut de cycle de vie n'était pas filtrable côté API — c'est ce que
> l'étape a d'abord dû ouvrir.** `LostItemRepository.list` honore
> `resolutionStatus` depuis toujours et `ListLostItemsFilter` le déclare, mais
> **aucun schéma ne le laissait passer** : `listLostItemsFilterSchema` ne le
> porte pas, et `/lost-items/mine` validait avec celui-là. Le front n'avait donc
> pas le choix — il lisait 50 annonces et filtrait en `useMemo`. R11 ajoute
> `myLostItemsFilterSchema` dans `@app/contracts/lost-items` (le calque exact de
> `adminListLostItemsFilterSchema`, une ligne d'`extend`) et le branche sur
> `listMine`. Le champ reste **hors** du schéma public : « Annonces » montre
> tout ce qui est publié, résolu compris. **Écart de portée assumé** : le plan
> annonce R11 en `client/account` et ne liste que des fichiers client ; l'étape
> touche aussi `packages/contracts` et `apps/api`, sans quoi son point 2 (« le
> loader appelle l'API avec ») est infaisable.

> **Les compteurs des puces tombent, et R13 les relèvera depuis le serveur.** La
> planche mobile écrit « Toutes · 6 | En ligne · 3 | Résolues · 2 » et la
> version large « 6 au total, 3 en ligne » : des nombres agrégés sur **toutes**
> les annonces, que le navigateur calculait jusqu'ici sur les 50 qu'il avait
> sous la main — donc faux au-delà. Une fois la pagination côté API, ils
> demandent une source serveur (un `groupBy` par statut), et c'est exactement ce
> dont R13 a besoin pour sa bannière de modération (« 1 annonce en attente, 1
> masquée »). Les deux vont ensemble, dans l'étape qui porte les puces. R11
> garde le seul nombre honnête qu'il ait : le `total` que l'API vient de compter
> pour les filtres de l'URL, affiché « 63 annonces » sans filtre et « 12
> résultats » avec.

> **Quatre puces au lieu de trois, et le vocabulaire de §2.3.** La règle 2 fixe
> « En ligne » / « Retrouvé » / « Archivée » ; l'écran disait « Actives » / «
> Résolues », et la planche mobile écrit « Résolues » là où la planche large
> écrit « Retrouvées ». **§2.3 tranche, contre l'artboard mobile.** Et «
> Archivées » n'existait pas du tout : une annonce `expired` n'était joignable
> que par « Toutes ». Les libellés et la quatrième puce arrivent donc ici, sans
> restyler quoi que ce soit ; le dessin des puces reste à R13.

> **`PaginationBar` et `FilterPill` remontent dans `app/components/`.** R9
> l'avait prévu pour la barre (« R11–R14 la remonteront si Mes annonces en veut
> une ») : c'est le cas, avec la même réponse qu'à R9 — pagination compacte,
> pour la position partageable dans l'URL, contre le chargement continu que la
> planche dessine. `helpers/page-window.ts` et son test suivent dans
> `app/shared/helpers/`. La puce suit pour une raison mesurée, pas par symétrie
> : les puces de l'écran étaient dessinées à `px-3 py-1.5 text-xs`, soit **28
> px** de haut, et `.touch-target` y ajoute 8 px de débord de chaque côté — deux
> rangées séparées par `gap-2` (8 px) se recouvrent alors de 16 px et **la
> dernière du DOM remporte les taps**, le piège exact payé à R10. `FilterPill`
> est dessinée à 38 px : 3 px de débord dans un écart de 8 px. À 320 px les
> quatre puces passent effectivement sur deux rangées, et le recouvrement mesuré
> vaut **0**.

> **La page au-delà de la liste se corrige dans l'adresse.** Supprimer la
> dernière annonce d'une dernière page laissait `?page=3` devant une liste de
> deux pages : écran vide, sans rien qui l'explique. Le loader compare `page` au
> `total` que l'API vient de rendre et `throw redirect` vers la dernière page
> réelle — l'adresse est l'état, donc c'est l'adresse qu'on corrige. Sept cas de
> test couvrent le calcul, dont la disparition complète du paramètre quand la
> liste tient sur une page.

> **Trois balayages restent sous plafond, et ce sont trois dettes.** Le
> `?pageSize=50` en dur disparaît de « Mes annonces », mais trois appelants
> lisaient la même fonction pour tout charger d'un coup : l'écran Compte
> (`account/_index.tsx`), son résumé d'activité (`activity.service.ts`, qui
> compte `active` et `pending` sur les éléments rendus) et le loader d'édition
> (`edit-post.loader.ts`, qui trouve son annonce par `.find` dans la liste). Le
> plafond est nommé — `SWEEP_PAGE_SIZE` dans `account-posts.service.ts`, exposé
> par `sweepMyLostItems` — au lieu d'être caché dans une URL, mais il reste : à
> 51 annonces, le résumé du compte se trompe et la 51ᵉ n'est pas modifiable.
> `GET /lost-items/:id` ne peut pas dépanner le second cas, il incrémente les
> vues. Les trois relèvent de la refonte de l'écran Compte et de R12.

> **Mesuré au navigateur, dans les deux thèmes.** Un stub d'API sur :3011 a
> servi 63 annonces à un utilisateur factice (`get-session` compris) sans rien
> écrire en base. À 320, 360, 390, 768, 1024 et 1280 px, sur sept états d'URL
> (page 1, 3, 6, chaque puce, aucun résultat) : `document.scrollWidth` égale
> exactement la largeur de la fenêtre — **y compris à 320 px**, où `/posts`
> déborde encore par son hero ; la plus petite cible tactile vaut **44 px** sous
> `lg` (38 au-dessus, où `.touch-target` s'éteint) ; le recouvrement pire cas
> vaut **0** entre puces comme entre pages. Les paires encre/fond des puces
> passent 4,5:1 dans les deux thèmes, la plus basse à **5,03** (blanc sur
> `--primary-green`), « Retrouvées » à 5,25 (`blue-600`) et « Archivées » à 7,81
> (`neutral-600`) — l'ancienne « Résolues » était en `blue-500`, soit **3,68**,
> sous le seuil pour du 12 px. Comportement vérifié : la puce écrit l'URL et
> remet `page` à 1, la recherche débattue écrit `q` **sans allonger
> l'historique** (`replace: true` : deux saisies successives laissent
> `history.length` inchangé et le retour arrière quitte l'écran), `?page=99` se
> corrige en `?page=6`, et l'annonce **n°51 est à l'écran** en page 5.

> **Une seule mesure à charge, héritée de R9** : la flèche « Page précédente »
> désactivée mesure 1,8:1 en clair. Un contrôle désactivé est formellement
> dispensé et R9 n'avait mesuré que l'état actif ; ce n'est pas une régression
> de R11, mais c'est noté.

> **Deux fautes de vocabulaire restent dans la carte**, hors portée : la
> pastille dit « Active » / « Expirée » / « Résolue » là où §2.3 règle 2 dit «
> En ligne » / « Archivée » / « Retrouvé », et « 1 contacts » n'est pas accordé.
> `listing-card.tsx` appartient à R12 et R13. — **Refermé par R12.**

#### R12 — Retours honnêtes sur les actions d'annonce

**Objectif** : corriger trois défauts de confiance, sans toucher au visuel.

1. Passer de `useFetcher` brut à `useActionFetcher` : la carte lit enfin
   `fetcher.data` et affiche les erreurs.
2. Déplacer les toasts dans un `useEffect` gardé sur `isOk` + un drapeau
   `hasSubmitted` — aujourd'hui ils s'affichent **avant** l'appel.
3. Rendre « Modifier » disponible sur toutes les annonces : la condition
   `moderationStatus === 'pending'` est une restriction du front seul,
   `UpdateLostItemUseCase` ne vérifie que la propriété.

**Fichiers** : `routes/account/posts/components/listing-card.tsx`. **Flux** : D.
**Acceptation** : une action qui échoue affiche une erreur et ne prétend pas
avoir réussi. **Tests** : projet `ui` — succès, échec API, erreur de champ.

> **Le troisième point demandait de lever DEUX gardes, pas une.** La condition
> `moderationStatus === 'pending'` de la carte n'était que la moitié : le loader
> d'édition redirigeait vers `/posts/:id` sur exactement le même test, donc
> lever l'une sans l'autre ne donnait rien. `UpdateLostItemUseCase` ne vérifie
> que la propriété (`requireOwnedLostItem`), les deux sont donc parties.

> **La maquette demandait une bannière qui aurait menti — deux fois.**
> `ModifierAnnonce` dessine « Toute modification renvoie l'annonce en
> validation. Elle restera visible en attendant. », et `note-comptesuite` en
> fait l'objet même de l'écran. Or `repository.update()` n'écrit jamais
> `moderationStatus` : aucune modification de contenu ne repasse en validation.
> La deuxième phrase est fausse pour une raison plus grave : une annonce
> `pending` est exclue de la liste publique (`moderationStatus: 'published'` en
> dur dans le contrôleur) et répond 404 à tout le monde sauf à son auteur. Tenir
> la promesse dessinée aurait donc **dépublié** une annonce en ligne parce que
> son auteur corrige une faute de frappe — sur une plateforme dont la
> joignabilité est tout l'intérêt. La voie « faire dire vrai à l'API » a été
> ouverte puis **abandonnée** pour cette raison : elle demande de découpler « en
> attente de relecture » de « non publiée » (une colonne `reviewPending`, une
> migration, une file de modération côté backoffice), ce qui est une étape à
> elle seule. R12 livre donc un `EDIT_NOTICES` à trois entrées qui dit ce qui se
> passe vraiment, par état de modération — dont « la corriger ne la remet pas en
> ligne » pour une annonce masquée, qui reste modifiable sans effet visible.

> **Une régression introduite puis mesurée puis corrigée.** « Modifier » rendu
> permanent ajoute 89 px à une rangée qui en faisait déjà 281, dans une carte en
> `overflow-hidden` : mesuré au navigateur, la corbeille était **coupée à 390
> px** (la largeur de téléphone la plus courante) et « Voir » **et** la
> corbeille disparaissaient à 320 px. Ce qui est coupé là est perdu pour de bon.
> Réponse : `flex-wrap` avec `gap-x-2 gap-y-1` sur la rangée d'actions — les
> quatre contrôles sont visibles de 320 à 1280 px, `scrollWidth` égale la
> fenêtre partout, et le recouvrement pire cas entre les deux lignes vaut **0**.

> **La corbeille n'avait aucun nom accessible** : un bouton d'icône seule, sans
> `aria-label`, que seul un test l'a révélé en ne le trouvant pas. Nommé «
> Supprimer l'annonce », et désactivé pendant une soumission comme ses voisins.

> **Deux pastilles échouaient au contraste, mesurées dans les deux thèmes.** «
> En attente » valait **1,91:1** en `bg-yellow-500 text-white` sur du 10 px, et
> « Retrouvée » **3,76:1** en `bg-blue-500` — le même `blue-500` que R11 avait
> déjà corrigé sur la puce de filtre juste au-dessus, qui aurait donc annoncé
> 5,25 pendant que la pastille du même concept restait à 3,76. Passées à
> `yellow-700` (4,93) et `blue-600` (5,25) ; les cinq pastilles passent
> maintenant 4,5:1 dans les deux thèmes, la plus basse à **4,93**.

> **Écart de vocabulaire refermé, celui que R11 avait laissé ouvert.** La
> pastille disait « Active » / « Résolue » / « Expirée » là où §2.3 règle 2 — et
> les puces de filtre livrées par R11 — disent « En ligne » / « Retrouvée » / «
> Archivée ». Le bouton « Marquer résolue » suit. « 1 contacts » et « 1 vues »
> sont accordés. Le tableau `STATUS_CONFIG` lui-même reste à R13, qui le
> réécrit.

> **`useSettledSubmission` remonte dans `shared/hooks/`.** Le hook vivait dans
> `routes/auth/hooks/` et R12 est le premier appelant hors de cette zone. C'est
> lui et non un drapeau posé à côté de `submit()` qui rend le point 2 correct :
> `submit()` ne quitte pas `idle` dans le lot de rendu qui l'appelle. Vérifié au
> navigateur : à 120 ms d'un écrit de 700 ms, **aucun** toast n'est affiché, là
> où l'ancien code en montrait un vert immédiatement ; l'échec donne un toast
> d'erreur et la pastille ne change pas.

> **Une fausse piste, notée pour ne pas la repayer.** `account/` redirige vers
> `/login` et non `/auth/login`, ce qui ressemble à un lien mort puisque les
> pages d'auth vivent dans `routes/auth/`. C'est correct : `layout()` est **sans
> chemin** en React Router, donc `route('login', …)` imbriqué donne bien
> `/login`. `AUTH_PATHS` le consigne déjà. Aucun changement. En revanche la
> liste de routes de `CLAUDE.md` annonce `/auth/login` et se trompe.

> **Une fragilité laissée à R13** : `STATUS_CONFIG[displayStatus]` n'a pas de
> repli, donc un statut hors énumération fait tomber la page entière en 500 —
> constaté pour de vrai en servant les valeurs Prisma en majuscules depuis le
> stub. Le contrat l'interdit côté API, c'est donc défensif ; R13 réécrit ce
> tableau et devrait le fermer.

#### R13 — Refonte de la carte d'annonce _(pilote)_

**Objectif** : séparer les deux axes d'état et poser le gabarit de liste.

1. Bannière en tête de liste pour la modération (« 1 annonce en attente », « 1
   masquée ») ; pastille sur la carte concernée.
2. Puces de filtre réduites au cycle de vie : Toutes · En ligne · Retrouvées ·
   Archivées.
3. Remplacer les quatre boutons de 32 px par un menu `⋯` en feuille inférieure.
4. Ligne de performance lisible : « 48 vues · 3 personnes vous ont écrit » — le
   second chiffre mis en avant quand il est non nul.
5. Dessiner les quatre états d'écran (§2.3, règle 5).
6. Le motif de masquage attend **A1** ; livrer sans, avec la pastille seule.

**Fichiers** : `routes/account/posts/components/listing-card.tsx`,
`routes/account/posts/_index.tsx`. **Flux** : D. **Acceptation** : les cinq
croisements d'état de la matrice rendent correctement, dans les deux thèmes.
**Tests** : projet `ui`, un cas par croisement.

> **Les trois chiffres de l'étape n'avaient aucune source, et c'est le vrai
> travail de R13.** Les compteurs par puce (retirés par R11), la bannière de
> modération et le rail de la planche large veulent tous la même chose : des
> nombres agrégés sur **toutes** les annonces du propriétaire. Aucun n'existait,
> et la modération n'était même pas comptable côté front — elle n'est pas un
> filtre du schéma. R13 ouvre donc `GET /lost-items/mine/summary` : deux
> `groupBy` narrowés par `userId`, rendant `{ total, lifecycle, moderation }`.
> **Écart de portée assumé**, la même forme qu'à R11 : le plan annonce R13 en
> `client/account` et ne liste que deux fichiers client, alors que ses points 1
> et 2 sont infaisables sans `apps/api`.

> **Le rail « ces 30 derniers jours » n'est pas dérivable, et il est reporté.**
> `note-carte` le décrit — vues, personnes qui ont écrit, objets récupérés — et
> `AnnonceCarte` affirme que « tout le reste de cette maquette tient sur les
> données existantes ». C'est faux pour ce rail : `views` et `contactsCount`
> sont des **compteurs sans horodatage**, il n'y a pas de `resolvedAt`, et
> `updatedAt` bouge à chaque modification. Deux des trois chiffres sont donc
> impossibles à fenêtrer sur 30 jours sans une table d'événements. Le rail
> attend cette migration ; l'endpoint s'arrête volontairement aux comptages
> plutôt que de servir des sommes que rien n'affiche.

> **Les compteurs sont non filtrés, et c'est un choix.** Une puce dit combien le
> visiteur en possède dans ce compartiment, pas combien la recherche en a trouvé
> : une exception de modération masquée par une recherche serait pire
> qu'absente. L'en-tête garde le nombre filtré que R11 a rendu honnête (« 12
> résultats »), donc les deux lectures coexistent sans se contredire.

> **Le rail vertical de filtres à `lg` est écarté.** `MesAnnoncesDesktop`
> remplace la rangée de puces par une liste verticale à compteurs alignés. R11 a
> mesuré cette rangée à six largeurs et deux thèmes ; une seconde implémentation
> du même filtre pour les mêmes données est un risque de régression sans
> bénéfice pour le visiteur. La carte à correspondances sur deux colonnes, elle,
> appartient à R14.

> **« Toutes » continue de tout compter.** La matrice écrit qu'une annonce
> archivée est « repliée derrière la puce Archivé, hors de la liste par défaut
> ». L'appliquer rouvrirait exactement le trou que R11 a fermé — une annonce
> `expired` joignable par aucune puce — et demanderait un filtre API de plus.

> **Le menu dessiné perdait « Voir l'annonce » ; il est gardé.** `AnnonceCarte`
> liste quatre entrées : Marquer retrouvé, Modifier, Partager, Supprimer. Sans «
> Voir », la page publique de l'annonce devient inatteignable depuis la carte,
> et la carte n'est pas un lien — le piège payé six fois. Cinq entrées donc, et
> **« Partager » n'apparaît que sur une annonce publiée** : une annonce en
> attente ou masquée répond 404 à tout autre que son auteur, donc en partager le
> lien serait une promesse fausse.

> **La date de l'objet cède la place à la date de publication**, contre le «
> couple lieu/date » du flux A (§2.2). Sur cet écran la question du propriétaire
> est « depuis quand est-elle en ligne », pas « quand l'ai-je perdu » — et une
> annonce en attente n'a pas été publiée du tout, elle a été _envoyée_, ce que
> la carte dit. La reconnaissance de l'annonce reste portée par le titre, la
> photo, le lieu et la pastille, identiques aux autres écrans. La planche écrit
> en plus « Récupéré le 12 août · 8 jours en ligne » sur une annonce retrouvée :
> rien n'enregistre cette date, donc la carte dit sa date de publication comme
> les autres.

> **Le cas normal perd sa pastille**, comme la matrice le demande : « Publiée +
> En ligne » est le cas ordinaire et n'a pas à s'annoncer. Le garde de
> vocabulaire que R12 avait posé porte donc désormais sur les quatre autres
> croisements.

> **Aucune puce n'est atténuée.** `MesAnnonces` met « Archivé » à `opacity: .5`
> quand le compartiment est vide. Atténuer un contrôle **actif** casse son
> contraste — c'est la mesure à 1,8:1 de la flèche désactivée, qui n'est
> dispensée que parce qu'elle est désactivée. Le compteur est affiché à la place
> et, sur un compte vide, aucun compteur n'est affiché du tout : quatre zéros ne
> renseignent personne.

> **Le tableau d'états existait en double, et c'est ce qui a fermé la dette de
> R12.** `STATUS_CONFIG[displayStatus]` n'avait pas de repli côté « Mes annonces
> » ; mais `account/components/recent-listings.tsx` en portait une **copie**,
> restée au vocabulaire d'avant R12 (« Active » / « Résolue » / « Expirée ») et
> aux deux fautes de contraste que R12 avait corrigées sur l'autre exemplaire —
> « En attente » à 1,91:1 et « Résolue » à 3,76:1. Les deux cartes lisent
> maintenant `helpers/listing-status.ts`, qui rend `UNKNOWN_LISTING_STATUS` pour
> un statut hors énumération : le tableau reste exhaustif à la compilation, la
> lecture est élargie par affectation et non par un `as`, et la page ne tombe
> plus en 500.

> **`text-destructive` mesure 2,98:1 en sombre.** La ligne « Supprimer l'annonce
> » de la feuille est du **texte** là où R12 n'avait qu'une icône, donc le seuil
> passe à 4,5:1 : mesurée à 4,77 en clair et **2,98 en sombre**, elle nomme sa
> propre paire (`text-red-700 dark:text-red-400`, 6,42 et 6,86). Le jeton
> lui-même reste inutilisable comme encre en sombre, et **17 points d'appel du
> client** s'en servent — dont tous les messages d'erreur de formulaire. Il
> manque un `--destructive-text`, exactement la forme que R3 a donnée au vert et
> à l'orange : c'est une dette `packages/ui`.

> **La bannière ne promet ni tri ni motif.** La planche large écrit « Les deux
> sont en tête de liste, avec le motif quand il y en a un » : l'API trie par
> `createdAt desc` et aucune colonne ne porte de motif (A1). Chaque phrase de
> `buildModerationNotice` décrit donc la visibilité, et celle d'une annonce
> masquée reprend le constat de R12 — « la corriger ne la remet pas en ligne ».

> **Le lien « Retour au compte » mesurait 20 px** sous `lg`, sans `touch-target`
> — la plus petite cible de l'écran, que R11 n'avait pas relevée. Corrigé ici ;
> **trois autres écrans portent le même lien** (`account/stickers`,
> `account/settings`, `notifications`), et R15 en touche deux.

> **Mesuré au navigateur, aux deux bouts et dans les deux thèmes.** Stub sur
> :3011 servant les six annonces des cinq croisements plus le résumé, à 320,
> 360, 390, 768, 1024 et 1280 px : `document.scrollWidth` égale exactement la
> fenêtre partout, les six cartes rendent partout, **la plus petite cible
> tactile vaut 44 px sous `lg`** et le recouvrement pire cas entre contrôles de
> la page vaut **0** — le menu `⋯` ne vole aucun tap. Les cinq lignes de la
> feuille mesurent 52 px. Contraste : tout ce que l'étape ajoute passe 4,5:1
> dans les deux thèmes, le plus bas à **4,93** (« En attente », 10 px) ;
> bannière à 8,38 / 16,9, « 3 personnes vous ont écrit » à 6,22 / 6,48,
> pastilles de 5,25 à 6,86. Seul le logotype « CI » reste sous le seuil (2,63 /
> 2,70), dette connue et dispensée. Les quatre états de §2.3 règle 5 sont
> vérifiés un par un : compte vide (« Aucune annonce », aucune bannière, aucun
> compteur), filtre sans résultat (« Aucun résultat » avec « 0 résultat » en
> tête et les compteurs intacts), chargement (quatre squelettes sous
> `aria-busy`, sur un stub ralenti à 2,5 s) et panne (l'API en 500 rend la
> bannière d'erreur avec « Réessayer » et le retour au compte, au lieu de faire
> remonter l'échec à la racine qui perdait la coquille). Enchaînement vérifié
> dans les deux thèmes : la feuille se démonte, la confirmation s'ouvre et le
> focus tombe sur « Annuler ».

> **Un recouvrement pré-existant, hors portée.** Deux liens de pied de page, « À
> propos » et « Politique de confidentialité », se recouvrent de 12 px à 390 px
> et de 6 px à 768 px — le débord de `.touch-target` dans un écart de rangée
> trop court. Reproduit sur `/about`, donc antérieur à R13 : c'est le `Footer`
> partagé, pas cet écran.

#### R14 — Correspondances sur une annonce

1. Bande verte dans la carte : « N objets trouvés pourraient correspondre ».
2. Réutiliser `findMatchingLostItems` — un appel à
   `/lost-items?type&category&ville&pageSize=4`, **aucun travail API**.
3. Charger en route ressource `fetcher.load`ée, pas dans le loader de page : la
   liste ne doit pas attendre les correspondances.
4. Ne rien afficher quand il n'y en a pas — pas de bande vide.

**Fichiers** : nouveau `routes/account/posts/servers/matches.loader.ts`,
`components/listing-card.tsx`, `app/routes.ts`. **Flux** : A, D. **Acceptation**
: la bande n'apparaît que sur les annonces en ligne et publiées.

> **La source n'est pas celle que le point 2 nomme.** Le plan dit de réutiliser
> `findMatchingLostItems`, c'est-à-dire `/lost-items?type&category&ville`. Cette
> requête ne peut pas exprimer trois des quatre règles du domaine `matching` :
> elle ne connaît pas `resolutionStatus` — le contrat public ne l'expose pas —
> donc elle proposerait des objets **déjà rendus** ; elle ne calcule aucun score
> ; et elle oblige le front à refaire l'inversion de type. Or
> `GET /lost-items/:id/matches` existe déjà, est `@AllowAnonymous`, et fait
> exactement le bon travail : type opposé, publié, encore actif, catégorie
> **ou** ville, score ≥ 50. C'est lui que R14 appelle. Le « aucun travail API »
> du plan reste vrai — il l'est même davantage.

> **Un appel groupé, pas un par carte.** Une page porte jusqu'à douze cartes ;
> un `fetcher` par carte ferait douze requêtes navigateur simultanées, chacune
> balayant cent candidats côté API. La route ressource prend donc `?ids=a,b,c` —
> dédoublonnés et plafonnés à `ACCOUNT_POSTS_PAGE_SIZE` — et éclate côté
> serveur, où l'API est à un saut. Le navigateur demande une fois, la liste a un
> seul état de chargement, et une carte sans bande reste complète.

> **La route ressource ne peut exporter que `loader`.** React Router ne retire
> le code serveur que de cet export : `matches.loader.ts` exportait aussi ses
> types et une fonction nommée, ce qui tirait `session.server` dans le bundle
> navigateur et faisait échouer `pnpm build` — jamais `typecheck`. Les types
> sont partis dans `routes/account/posts/types/matches.ts`. `publish/matches`
> respectait déjà la règle sans la dire.

> **« Signalés à Cocody cette semaine » n'est pas dérivable, et la moitié en est
> fausse.** Le seul filtre de date de l'API porte sur `eventDate` — la date où
> l'objet a été perdu ou trouvé — jamais sur la date de signalement, que rien
> n'indexe : « cette semaine » est le même mirage que le rail « 30 derniers
> jours » de `note-carte`. Quant à la ville, le score peut retenir un candidat
> sur sa seule catégorie, donc elle n'est pas garantie. Le sous-titre l'affirme
> quand elle est vraie de tout ce que la feuille montre — « Signalés à Cocody »
> — et retombe sinon sur ce que la requête garantit littéralement, le `OR` du
> repository : « Même catégorie ou même ville ».

> **Le chevron ouvre une feuille, pas une liste filtrée.** Le dessin met un
> chevron (mobile) et un bouton « Voir » (desktop) sans dire vers quoi. Un
> `/posts?category&ville` ne reproduit pas le score qui a sélectionné les
> candidats : il répondrait avec un autre ensemble, parfois vide. La bande ouvre
> donc une feuille inférieure — la forme que §2.1 donne à ce qui interrompt, et
> celle que R13 a posée pour le menu `⋯` — qui liste les quatre meilleurs,
> chacun lié à son annonce. Au-delà de quatre, une ligne le dit.

> **`lg:col-span-2` écarté.** `note-carte` veut que la carte à correspondances
> prenne deux colonnes. Dans une grille non `dense`, un élément large qui ne
> tient pas dans la ligne courante en ouvre une nouvelle et laisse un trou
> derrière lui ; `grid-flow-dense` le comblerait en réordonnant, ce qui casse
> l'ordre chronologique de la liste. Mesuré à 1280 px : la grille égalise déjà
> les hauteurs par rangée et la composition est propre sans lui. Écarté avec le
> rail de la même note.

> **Aucun squelette de bande.** Les quatre états de §2.3 règle 5 sont ceux de
> l'écran, que R13 a livrés. La bande, elle, n'a que deux issues visibles :
> présente ou absente. Dessiner un squelette sur chaque carte éligible ferait
> clignoter la page entière pour, le plus souvent, ne rien annoncer — le point 4
> du plan dit exactement cela. Vérifié : un échec de l'appel de correspondances
> laisse les six cartes et zéro bande, sans erreur.

> **Ce que la mesure a donné.** Contrastes de la bande, sonde par lecture de
> pixel : titre 8,65 (clair) / 16,68 (sombre), sous-titre 5,15 / 10,83, loupe
> blanche sur `--primary-green` 5,03 aux deux. Aucune cible tactile nouvelle
> sous 44 px et aucun recouvrement en flux à 390 px. `/account/posts/matches`
> répond bien 200 JSON malgré `account/posts/:id` : le segment statique gagne.
> Le titre passe sur deux lignes à 390 px — le français est plus long que la
> maquette, et deux lignes valent mieux qu'une troncature du nombre.

#### R15 — Stickers, commandes et réglages

1. **Mes stickers** : compteur d'activation, bouton « Scanner un sticker » en
   tête, filtres Tous / Actifs / En attente, entrée « Commander d'autres ».
2. **Mes commandes** : suivi en quatre étapes, montant dû au coursier rappelé —
   c'est l'information qu'on vient chercher —, historique, « Commander à nouveau
   ».
3. **Réglages** : regrouper les informations personnelles aujourd'hui
   éparpillées dans quatre boîtes de dialogue ; la section Apparence vient de
   R5.

**Fichiers** : `routes/account/stickers/`, `routes/account/orders/`,
`routes/account/settings/`. **Flux** : C. **Acceptation** : les trois écrans
utilisent le même vocabulaire de carte et de pastille que R13.

> **« Scanner un sticker » n'est pas l'action dominante, et ne peut pas
> l'être.** Le point 1 et l'artboard mettent ce bouton en tête. Or `/scan`
> navigue vers `/q/:code`, qui affiche « Sticker non activé » pour un jeton
> encore `generated` : le scan ne sait rien activer avant R20/R22, qui posent le
> couple caméra + activation du flux C. Le geste dominant serait donc une
> impasse. R15 inverse le couple que la maquette dessine : le bouton plein 52 px
> ouvre le dialogue d'activation — le seul chemin qui aboutit — et « ou scanner
> un sticker » est le lien secondaire dessous. **R20 remet le scanner en tête**
> une fois qu'il active.

> **« Scanné il y a 2 h · 1 message » est indérivable.** La maquette met en
> avant une carte de sticker fraîchement scanné, avec le nombre de messages
> reçus. `QrToken` ne porte ni horodatage de scan ni compteur : ses seules dates
> sont `createdAt`, `activatedAt` et `revokedAt`. Une `Notification` de type
> `QR_SCAN` existe, mais elle ne référence le jeton que par un `link` textuel,
> ce qui n'est pas une jointure. C'est la même cause que le rail « 30 derniers
> jours » de `note-carte` et que « signalés cette semaine » de R14 : il manque
> une table d'événements. La carte de mise en avant est écartée.

> **Les deux interrupteurs d'Alertes restent éteints.** L'artboard `Reglages`
> les dessine **actifs**, en vert. Rien ne les porte : `User` n'a aucune colonne
> de préférence et l'API n'expose aucun point d'entrée. Un interrupteur qui
> bouge promettrait un réglage que personne ne stocke — la faute que R12 a
> nommée. La section reprend le vocabulaire de la maquette (« Alertes », «
> Objets qui correspondent », « Scans de mes stickers ») et garde le badge «
> Bientôt disponible » avec les interrupteurs désactivés.

> **Un quatrième filtre, « Désactivés ».** L'artboard en dessine trois — Tous /
> Actifs / En attente. Un sticker révoqué n'est ni l'un ni l'autre : il serait
> joignable depuis « Tous » et nulle part ailleurs, exactement le trou que R13 a
> fermé sur « Archivées ». « Tous » compte tout, révoqués inclus, comme « Toutes
> » sur « Mes annonces ».

> **« 9 restants » devient « 8 en attente ».** La phrase de la maquette suppose
> que tout sticker est actif ou en attente, donc que le reste vaut
> `total − activés`. Un sticker révoqué n'est ni l'un ni l'autre, et cette
> soustraction le compterait comme activable. Le compteur nomme donc ce qui
> reste réellement à activer, et se tait quand il n'y en a aucun plutôt que
> d'afficher « 0 restants ».

> **Les filtres des stickers sont locaux, pas dans l'URL.** R11 a mis ceux de «
> Mes annonces » dans la query string parce que sa pagination est serveur. Ici
> le loader ramène la page entière (`pageSize=50`) et le filtrage est en mémoire
> : passer par l'URL coûterait un aller-retour API à chaque clic de puce, pour
> un tri que le navigateur fait déjà.

> **Un seul jeu de mots pour l'état d'une commande** (§2.3 règle 2) : Reçue,
> Préparée, En route, Livrée, Annulée — ceux de la maquette, qui tiennent dans
> les quatre colonnes du rail. Ils remplacent « En attente / En préparation / En
> livraison », qui disaient la même chose plus longuement et divergeaient du
> rail. La pastille, le rail et l'écran nomment désormais le même état du même
> mot. Le suivi se dérive du seul `status` : il n'y a pas de `processedAt`, donc
> une étape est franchie parce que la commande l'a dépassée, non parce qu'une
> date le dit.

> **Pas de filtres sur « Mes commandes ».** L'écran en portait six ; ni le plan
> ni l'artboard n'en demandent. La maquette sépare autrement, et mieux : la
> commande en cours est dépliée en tête — c'est ce qu'on vient chercher — et le
> reste tombe sous « HISTORIQUE ». Le détail en `fixed` fait main disparaît avec
> eux : la carte active montre déjà l'adresse, le suivi et le montant.

> **« Le coursier vous appelle avant de passer » n'est pas repris.** C'est une
> promesse opérationnelle que rien dans le code ne garantit. La carte affiche
> l'adresse et, quand la commande en porte une, la note de livraison que
> l'acheteur a lui-même écrite.

> **« Même pack, même adresse, en deux taps » devient le pack seul.** «
> Commander à nouveau » ouvre `/stickers/order?pack=<id>`, et le tunnel
> préremplit ce pack s'il est au catalogue. L'adresse n'est pas portée : une
> adresse dans une URL partageable est une donnée personnelle qui fuit, et le
> coursier la redemande de toute façon. C'est le seul fichier hors des trois
> dossiers que le plan nomme — `routes/stickers/order/_index.tsx` plus un
> helper.

> **Le montant ne dit « Paiement à la livraison » que si c'est vrai.** La carte
> lit `stickerPaymentMethodLabel(order.paymentMethod)` : une commande antérieure
> au paiement à la livraison porte encore son mode mobile-money, et l'annoncer «
> à payer au coursier » serait faux. Le prix et le libellé du pack viennent de
> `@app/contracts/sticker-orders`, y compris le « Dès 2 000 F » de la bande, qui
> est le minimum du catalogue et non une constante d'écran.

> **Le numéro de téléphone est enfin lisible.** Les réglages affichaient
> `+2250700000000` d'un bloc. `formatPhoneForDisplay` le rend
> `+225 07 00 00 00 00` — la forme de la maquette et celle qu'on dicte — et
> laisse tel quel un numéro que la règle ivoirienne ne reconnaît pas, pour ne
> pas défigurer un compte antérieur à cette règle.

> **`tracking-tight` mange l'espace des milliers.** Sur le montant en 17 px, la
> fine insécable qu'`Intl` place entre les milliers disparaissait : « 4 500 » se
> lisait « 4500 ». Mesuré au navigateur, corrigé en retirant le resserrement sur
> ce seul nombre.

> **Deux gardes de soumission fautives, pas une.** La dette n'en nommait qu'une,
> dans `activate-sticker-dialog.tsx` ; `sticker-card.tsx` en portait deux autres
> (`hasSubmittedUpdate`, `hasSubmittedRevoke`). Les trois passent à
> `useSettledSubmission`. Au passage, les deux dialogues de sticker abandonnent
> la validation `useState` faite main pour react-hook-form + un schéma que
> **l'action lit aussi** : elle acceptait jusqu'ici n'importe quel `label`.

> **Un échec de formulaire ne toaste plus.** `FormRootError` porte déjà le
> message, dans le dialogue que le lecteur regarde ; le toast le répétait mot
> pour mot. La révocation, qui n'a pas de formulaire, garde le sien.

> **Le lien « Retour au compte » passe à 44 px** sur `account/stickers` et
> `account/settings`, les deux écrans de la dette que R15 traverse. Il reste à
> 20 px sur `notifications`.

> **Cibles et contrastes mesurés au navigateur**, sur les trois écrans, dans les
> deux thèmes et à 320 / 390 / 768 px : aucun texte sous son plancher (le plus
> bas est 4,93:1, la pastille « En attente »), aucune cible sous 44 px, aucun
> recouvrement — après avoir écarté « Activer un sticker » de « scanner un
> sticker », qui se recouvraient de 5 px par le débordement de `.touch-target`.

### Lot 5 — Accueil

#### R16 — Hero reconstruit sur une grille

1. Une grille explicite `lg:grid-cols-[1.1fr_0.9fr]`, texte aligné à gauche : le
   déséquilibre venait de la cohabitation d'une colonne centrée et d'un visuel
   en `absolute`.
2. Supprimer `min-h-[85vh]` ; dimensionner par le contenu, et faire dépasser le
   bloc suivant dans l'écran d'ouverture.
3. Double action « J'ai perdu » / « J'ai trouvé » sous la recherche.
4. Monter `HeroMap` derrière un test de largeur côté client, ou l'extraire en
   `.svg` statique : elle génère ~1 000 cercles rendus côté serveur pour un
   conteneur `hidden xl:block`.
5. Sortir le mot défilant du `h1`, ou le figer sous `md`.

**Fichiers** : `routes/home/components/hero-section.tsx`, `hero-map.tsx`.
**Flux** : A, B, C. **Acceptation** : même composition à toutes les largeurs ;
le visuel apparaît dès `md`.

> **Le mot défilant ne survit pas à la maquette.** Le point 5 laissait le choix
> entre le sortir du `h1` et le figer sous `md` — les deux supposent qu'il
> reste. Les quatre planches (`Main`, `AccueilSombre`, `Tablette`, `Desktop`)
> portent le même titre statique en deux lignes, « Perdu quelque chose ? / La
> communauté cherche avec vous. », et aucune ne montre de mot qui tourne.
> Tranché en faveur de la maquette : `CyclingWord`, `CYCLING_WORDS`, le
> `setInterval` et les réserves `min-w-45/60/75` qu'il imposait au titre
> disparaissent. C'est la lecture la plus forte du point 5.

> **~1 000 cercles, en fait 841.** Le point 4 annonçait l'ordre de grandeur ;
> `generateDots()` en produit **841** sur 1 368 points de grille testés, et le
> SVG en compte **897** en tout (841 points, 47 marqueurs de ville, 9 paquets
> animés). Mesuré, pas estimé. Le HTML rendu côté serveur en portait **905**,
> marqueurs des autres sections compris.

> **Le test de largeur, pas le `.svg` statique.** Des deux options du point 4,
> la première : `useMediaQuery('(min-width: 768px)')`
> (`shared/hooks/use-media-query.ts`), qui répond `false` sur le serveur **et**
> pendant l'hydratation, donc la carte n'entre jamais dans la charge SSR. Un
> `.svg` figé aurait coûté l'animation des flux, qui est ce que la carte
> raconte. **Mesure** : la page d'accueil rendue côté serveur passe de **187 029
> à 50 667 octets** (−73 %) et de **905 à 11** cercles.

> **La carte descend à 768 px**, comme `note-formats` le demande (« le visuel du
> hero descend à 768 px au lieu d'attendre 1280 ») : elle était derrière
> `hidden xl:block`, donc un iPad portrait n'avait ni la carte ni, avant R2, la
> navigation basse. Mesurée absente à 320 et 390 px, présente à 768, 1024
> et 1440.

> **Trois écarts de contenu laissés à R17, qui les possède.** Les planches
> montrent une pastille « 412 annonces · 37 objets rendus ce mois » à la place
> des trois points de réassurance : c'est le point 2 de R17 (« compteur réel à
> la place des points de réassurance déclaratifs »), donc `TRUST_POINTS` reste
> une étape de plus plutôt que de laisser un trou. Les planches montrent aussi
> une rangée de puces de catégories sous les deux actions : **aucune étape du
> plan ne la possède**, et §2.1 la range dans les listes secondaires — laissée à
> R17 avec la bande d'annonces récentes. Le sous-titre, lui, n'apparaît que sur
> `Desktop` : il est donc en `hidden lg:block`, avec la phrase de la planche,
> qui nomme le sticker QR et sert le flux C.

> **La barre de recherche n'est pas au format de la planche sur téléphone.**
> `Main` montre un bouton rond à icône ; le code garde le bouton « Rechercher »
> écrit, parce que `submit` est une prop de `components/search-bar.tsx`, partagé
> avec l'en-tête et `/posts`, et qu'aucun des cinq points de R16 ne le vise.
> Conséquence mesurée à 390 px : le champ ne fait plus que **167 px** et son
> texte d'invite est tronqué. **Antérieur à R16** — l'ancien hero avait la même
> largeur — mais à corriger, et cela demande une option responsive dans
> `SearchBar`. Le champ mesure par ailleurs **48 px** là où §2.1 en demande 52 ;
> même cause, même fichier.

> **Deux corrections venues de la relecture du rendu, hors des cinq points.**
> (a) **Zones sûres** : la section pose
> `pl-[max(1rem,env(safe-area-inset-left))]` et son symétrique à droite. En
> paysage sur un téléphone à encoche, la découpe mange une gouttière entière, et
> rien dans le contenu des pages ne lisait ces deux insets — seuls la barre
> d'onglets, les feuilles et `/q` le font. **Le reste des écrans est dans le
> même cas** : dette ouverte ci-dessous. (b) **La grille est plafonnée à
> `max-w-7xl`** et la carte grandit en `2xl:h-125` : la mesure du texte s'arrête
> à 620 px, donc au-delà toute la largeur gagnée tombait **entre** les deux
> colonnes. Mesuré à 1 600 px : le vide central passe de **352 à 178 px**, et il
> ne bouge plus jusqu'à 2 560 px.

> **Cibles et contrastes mesurés au navigateur**, à 320 / 390 / 768 / 1024 /
> 1440 px et dans les deux thèmes : aucun débordement horizontal (320 px
> compris), quatre cibles par écran toutes à 44 px ou plus, aucun recouvrement,
> et aucun texte sous son plancher — le plus bas est **5,03:1** (« J'ai trouvé »
> en blanc sur le vert, et le bouton « Rechercher »). L'aplat orange porte
> `--accent-orange-foreground` à **6,39:1**, jamais du blanc. La sonde a d'abord
> rendu des ratios identiques en clair et en sombre : le thème se pose par un
> **cookie** `theme`, pas par `localStorage`, et elle affiche désormais le thème
> réellement appliqué pour que l'oubli ne repasse plus.

> **`min-h-[85vh]` retiré, et le bloc suivant dépasse bien dans l'écran
> d'ouverture** (point 2) : à 390 px le hero mesure 419 px sous un en-tête de 65
> px, donc « Tout pour retrouver vos objets » commence à **484 px** — visible
> sans défiler sur tout téléphone. L'indicateur de défilement du bas a disparu
> avec le `85vh` qui le justifiait.

#### R17 — Annonces récentes et bloc stickers

1. Bande d'annonces récentes sous la recherche, alimentée par le loader existant
   — l'accueil n'affiche aujourd'hui aucune donnée réelle.
2. Compteur réel (annonces en ligne, objets rendus) à la place des points de
   réassurance déclaratifs.
3. **Bloc stickers en position 2** : visuel produit, prix depuis
   `@app/contracts/sticker-orders`, « payez à la livraison ».
4. Bento réduit à quatre tuiles utiles ; supprimer « Simple et rapide » et «
   Entraide », décoratives et hors palette.
5. Instrumenter le bloc stickers (§8).

**Fichiers** : `routes/home/_index.tsx`, `components/bento-grid-section.tsx`,
nouveau `components/recent-listings-strip.tsx`,
`routes/home/servers/home.loader.ts`. **Flux** : A, C. **Acceptation** : la
tuile stickers est atteinte au deuxième écran de défilement, contre cinq
aujourd'hui.

> **Le bento est parti, pas réduit.** Le point 4 demandait « quatre tuiles
> utiles » ; les **quatre** planches d'accueil (`Main`, `AccueilSombre`,
> `Tablette`, `Desktop`) n'en dessinent **aucune**, et `Main` est une page
> complète — en-tête, pied de page et barre d'onglets comprises. Elle enchaîne
> hero → annonces récentes → stickers → « Comment ça marche » → pied. Garder les
> quatre tuiles vendait les stickers **deux fois** sur la même page, une fois en
> position 2 et une fois en tuile bento. Tranché en faveur de la maquette :
> `BentoGridSection` **et** `CtaSection` sont commentées dans `_index.tsx`, les
> deux fichiers restent intacts, et le commentaire de la tuile « download » n'a
> pas été touché.

> **Le compteur ne porte qu'un chiffre, parce qu'un seul est réel.** Les
> planches écrivent « 412 annonces · 37 objets rendus ce mois ». Le premier
> vient du `total` de `GET /lost-items`. Le second n'est servi par **aucun**
> point d'entrée public : R11 a gardé `resolutionStatus` hors de
> `listLostItemsFilterSchema`, et `/stats` est `@Roles(['admin'])`. §3 impose «
> données réelles, ou rien du tout », donc la pastille dit « N annonces en ligne
> » et se **taise** quand le compte est nul ou que l'appel a échoué. Le second
> chiffre est déjà possédé par **A5**, qui porte l'endpoint public des deux
> nombres pour le panneau d'auth : l'accueil en devient le second consommateur,
> et rien de nouveau n'est ouvert pour lui.

> **La rangée de puces de catégories, qu'aucune étape ne possédait**, est prise
> ici avec la bande (R16 l'avait laissée). Quatre entrées vers
> `/posts?category=…`, dont les libellés viennent de `CATEGORY_FILTERS` et non
> d'une table locale : `SHORTCUT_IDS` est typé `readonly LostItemCategory[]`,
> donc une catégorie retirée du contrat est une erreur de compilation. La
> planche écrit « Papiers » ; le code dit **« Documents »**, le pluriel que
> `posts.const.ts` porte déjà — §2.3 règle 2 interdit le synonyme. La planche
> atténue la quatrième puce à 45 % d'opacité : écarté, « aucune puce atténuée »
> a été tranché en R13.

> **« Trouvé », pas « Retrouvé », sur la pastille de type.** §2.3 règle 2 liste
> « Retrouvé » dans les **deux** vocabulaires — type d'objet ET cycle de vie —
> ce qui est un défaut du plan : le mot ne peut pas désigner deux axes. R13
> avait déjà tranché « Trouvé » pour le type, et les planches écrivent « TROUVÉ
> ». La bande suit R13. **`/posts` dit encore « Retrouvé »** dans
> `components/listing-card.tsx` (deux fois),
> `details/components/post-content.tsx` et le libellé `TYPE_FILTERS` : **dette
> ouverte**, une passe de vocabulaire sur `client/posts`, hors du périmètre de
> R17.

> **Une seule forme de carte pour la bande.** §2.1 connaît deux photos — 84 px
> en liste, 108 px en grille — et les planches en utilisent les deux : `Main` et
> `Desktop` dessinent la forme grille, `Tablette` la forme liste. La bande n'a
> pas de bascule liste/grille, donc elle garde la **grille** partout :
> défilement horizontal sous `sm`, deux colonnes à `sm`, quatre à `lg`.

> **`StickerMark` est remonté dans `app/components/`.** R32 avait déjà dessiné
> le produit — « a hero that shows the thing being sold cannot wait for a shoot
> » — et le bloc de l'accueil vend le même objet que la page Stickers. Dès qu'il
> sert deux routes, il relève de `app/components/` selon la disposition du
> `CLAUDE.md`. Un seul consommateur à corriger (`stickers-hero.tsx`), donc la
> dette est fermée plutôt qu'ouverte, contrairement à `WhatsAppIcon`.

> **Le prix est dit une seule fois, sur la pastille du visuel** — comme `Main`
> le dessine. Elle est passée **sous** le sticker au lieu de le chevaucher :
> posée en `-bottom-2 -right-2`, elle recouvrait le libellé « Scanner si trouvé
> » que `StickerMark` porte lui-même. Le CTA dit donc « Commander mes stickers »
> et non « Commander · dès 2 000 FCFA » comme `Desktop` l'écrit : deux prix à 40
> px l'un de l'autre ne renseignent pas deux fois. Le chiffre vient de
> `STICKER_PACKS`, et l'unité est **FCFA**, ce que le reste de l'app écrit déjà
> (`order-more-cta.tsx`) — les planches abrègent en « F ». La pastille et le
> visuel existent **deux fois** dans le DOM, une fois par mise en page : la
> grille place le visuel dans sa propre colonne à `lg` et à côté du texte en
> dessous, ce qu'un seul nœud ne peut pas faire. Un `useMediaQuery` à la R16
> n'était pas justifié — le sticker est un SVG de quelques centaines d'octets,
> là où `HeroMap` en pesait 136 Ko.

> **Le bloc stickers est sombre dans les deux thèmes**, comme les planches : le
> produit est une surface, pas une section thémée. Il utilise `bg-neutral-900`,
> l'aplat sombre fixe que l'app pose déjà, plus une bordure en thème sombre pour
> rester une surface distincte sur une page quasi noire (`AccueilSombre` fait
> exactement cela : `#131C17` sur `#080A0E`, bordure `#26332C`). Aucune couleur
> littérale n'a été ajoutée.

> **« Comment ça marche » a été repris, ce que les cinq points ne demandaient
> pas.** La section jurait d'échelle avec les blocs compacts qui la précèdent
> désormais, et portait le pire texte de la page : des numéros d'étape de **72
> px à 1,1:1**, soit le plus grand et le moins lisible. `Main` la dessine en
> trois rangées ; le code les reprend, avec la copie courte des planches. Sur la
> même page, donc dans le périmètre `client/home`.

> **Un débordement horizontal introduit puis corrigé, mesuré.** La rangée de
> puces portait `-mx-4 … px-4 w-full` : une marge négative sur un enfant flex
> **élargit** la colonne, et l'élément de grille ne peut pas redescendre
> en-dessous. Mesuré à 390 px : la colonne texte faisait **430 px dans un écran
> de 390**, et l'`overflow-hidden` du hero coupait la barre de recherche, « J'ai
> trouvé » et la quatrième puce — définitivement. Les marges négatives sont
> parties (les planches ne débordent pas les puces non plus) et la colonne porte
> `min-w-0`. Après correction : la colonne s'arrête à 374 px, et aucun élément
> de `main` ne sort de l'écran à 320, 360, 390, 430, 768 ni 1440 px.

> **La barre de recherche est passée au format des planches.** Dette ouverte par
> R16 et fermée ici, parce qu'elle était le contrevenant visible du hero :
> `Main` et `Tablette` dessinent un **bouton rond à icône**, `Desktop` seul
> écrit « Rechercher ». `SearchBar` savait déjà faire l'icône, il lui manquait
> le caractère responsive — d'où `submit="responsive"` (icône sous `lg`, mot à
> partir de `lg`). Le champ passe aussi de **48 à 52 px**, ce que §2.1 demande.
> **Mesuré à 390 px : le champ passe de 167 à 248 px et son invite n'est plus
> tronquée.** Elle l'est encore à 320 px (178 px de champ pour 217 px d'invite),
> largeur extrême laissée telle quelle.

> **Deux défilements horizontaux, sans barre.** `.scrollbar-hide` existait déjà
> dans `packages/ui` et servait `/posts` et la galerie du détail ; les deux
> défileurs de l'accueil le portent aussi.

> **Mesures.** À 390 px la page passe de **4 458 px (5,3 écrans) à 1 712 px (2,0
> écrans)**, et le bloc stickers de l'**écran 3,5 à l'écran 2,0** — le critère
> d'acceptation est tenu. ⚠️ **Le plan annonçait « cinq écrans » : c'est la
> hauteur de la page, pas la position de la tuile, qui était à 3,5.** Aucun
> débordement à 320/360/390/430/768/1024/1440 px, dans les deux thèmes. Quinze
> cibles hors pied de page, toutes à 44 px ou plus, aucun recouvrement. Aucun
> texte sous son plancher hormis le « CI » du logotype (2,70:1, dispensé et
> antérieur) ; le plus bas est **5,03:1**. La charge rendue côté serveur passe
> de 50 667 à 57 951 octets.

> ⚠️ **La sonde de contraste a menti deux fois avant de dire vrai**, et les deux
> signatures sont consignées dans les pièges. (a) `getComputedStyle().color`
> rend de l'**`oklch()`** que le canvas ressert tel quel si on le parse soi-même
> : signature, **tous les ratios identiques à 2,44**. Il faut affecter la chaîne
> CSS à `ctx.fillStyle` et relire le **pixel**, jamais la chaîne. (b) Le test de
> transparence `rgba?\([^)]*,\s*0\s*\)$` matche **`rgb(245, 124, 0)`** — l'aplat
> orange — sur son canal bleu nul, donc l'orange n'était jamais peint :
> signature, l'aplat orange à **1,04** au lieu de 6,39. N'écarter que les
> couleurs à **quatre** composantes dont la quatrième est nulle. La sonde porte
> désormais **deux autotests** qui doivent sortir 17,28/18,98 et 6,39 avant
> qu'on lise son verdict.

> **Trois dettes laissées ouvertes par R17.** (a) **La passe de vocabulaire sur
> `client/posts`** ci-dessus : « Retrouvé » y désigne encore le type d'objet, où
> R13, les planches et la bande disent « Trouvé », et §2.3 règle 2 se contredit
> sur ce mot — le plan est à corriger en même temps que le code. (b) **L'invite
> de la recherche reste tronquée à 320 px** : 178 px de champ pour 217 px de
> texte. Raccourcir l'invite la ferait mentir sur ce qu'on peut chercher, donc
> laissée telle quelle à la largeur extrême. (c) **La taille du texte et des
> boutons sur téléphone, à l'échelle de l'application** : R17 a ramené l'accueil
> au format des planches, mais les quinze autres écrans gardent leur échelle.
> Une échelle typographique mobile est une étape transversale du même genre que
> R2 (cibles) et R3 (couleurs) — voir **R33** ci-dessous.

#### R33 — Échelle typographique et boutons mobiles

Ouverte par la relecture de R17 sur un vrai téléphone : le texte et les boutons
sont trop grands sur mobile, à l'échelle de **toute** l'application, et c'est ce
qui produit les débordements. R17 a ramené l'accueil au format des planches ;
les quinze autres écrans gardent leur échelle. C'est une étape transversale du
même genre que R2 (cibles) et R3 (couleurs) — elle touche `packages/ui` et tous
les écrans, donc elle ne peut pas rouler à l'intérieur d'une étape d'écran.

1. **Relever l'échelle réelle avant de la changer** (§1.1) : mesurer au
   navigateur, à 320 et 390 px, la taille de police et la hauteur de chaque
   titre, corps, bouton et champ de chaque écran, et comparer aux planches. Les
   planches sont l'étalon : `h1` 30 px, `h2` 19 px, corps 13–14 px, bouton 15
   px/52 px, puce 13 px/38 px, champ 16 px/52 px.
2. **Un jeu de tailles nommées** dans `packages/ui`, plutôt que `text-3xl` au
   cas par cas : un écran ne doit pas pouvoir inventer une échelle.
3. **Ne pas descendre les champs sous 16 px** : sous 16, iOS zoome au focus
   (§2.1). La contrainte va contre le reste de l'échelle et gagne.
4. **Ne pas descendre les cibles sous 44 px** : R2 l'a posé, R33 ne le rouvre
   pas. « Boutons trop grands » veut dire trop de rembourrage horizontal et une
   police trop grosse, pas une cible plus petite.
5. **Sonde de débordement en test**, pas seulement à l'œil : le débordement de
   R17 était invisible pour `document.scrollWidth` parce qu'un `overflow-hidden`
   le coupait. Comparer chaque élément au bord de son ancêtre **clippant**, et
   distinguer un défileur légitime d'une coupe.

**Fichiers** : `packages/ui/src/styles/globals.css`,
`packages/ui/src/components/`, tous les `apps/client/app/routes/`. **Flux** :
les cinq. **Acceptation** : à 320 et 390 px, aucun élément coupé par un ancêtre
clippant sur aucun écran, et aucune cible sous 44 px.

> **L'échelle est redéfinie, pas renommée.** Le point 2 demande un jeu de
> tailles nommées ; les remplacer classe par classe aurait touché plus de six
> cents appels et laissé chaque écran libre d'en inventer une autre le
> lendemain. `--text-*` est donc redéfini dans le `@theme` de `packages/ui` :
> l'échelle **est** l'inventaire, et un écran ne peut plus sortir du jeu parce
> qu'il n'y a plus rien dehors. Sept barreaux — 12, 13, 14, 15, 16, 18, 26 — au
> lieu de seize tailles mesurées.

> **La dérive était pire que le plan ne le disait.** Relevé avant de changer
> quoi que ce soit, sur neuf écrans publics et sept largeurs (320 → 430) :
> **seize tailles de police distinctes** et **dix hauteurs de contrôle**. Dont
> dix-neuf tailles arbitraires en cent trente et une occurrences, `text-[8px]`
> et `text-[9px]` comprises, et des hauteurs de bouton à 24, 35, 40, 64, 68 et
> 86 px. Le `h1` était à **36 px** partout où les planches disent 30, et le `h2`
> à 30, 24, 22 ou 20 px selon l'écran là où elles disent 19.

> **Deux jetons de rôle vivent à côté de l'échelle, et c'est le point 3 qui
> l'impose.** `text-field` vaut 16 px par rôle, pas par barreau ; de même
> `--spacing-control` (48) et `--spacing-chip` (34). La raison est une
> régression observée à l'instant où l'échelle a bougé : R19 avait choisi
> `text-base` sur le formulaire de `/q/:code` **parce qu'il valait 16 px**, en
> le documentant, et le nouveau barreau l'a ramené à 14 sans un mot. Un plancher
> tenu par un barreau n'est pas un plancher. Les cinq groupes de champs sur
> mesure passent donc à `text-field`, et `Input` / `Textarea` de `packages/ui`
> aussi — leur `md:text-sm` faisait par ailleurs 13 px sur une tablette, la
> dette relevée par R20.

> **§2.1 est amendé sur cinq lignes**, ce qu'une étape de socle est en droit de
> faire et une étape d'écran non : action primaire et champ passent de 52 à 48
> px, la puce de filtre de « 34–38 » à 34, les capitales de la pastille de 10 à
> 12 px, et « ce qui n'existe plus » interdit désormais **toute** taille
> arbitraire sur la base mobile, pas seulement `text-[10px]` et `text-[11px]`.

> **La règle des 44 px n'est pas rouverte, et c'est elle qui rend la réduction
> possible.** `.touch-target` fabrique la zone de tap par pseudo-élément sous
> `lg` : un contrôle peut donc _paraître_ nettement plus petit sans devenir plus
> difficile à atteindre. La ligne « Cible tactile » de §2.1 le dit maintenant
> explicitement — la zone de tap, pas le dessin — parce que la confondre avec la
> boîte dessinée est ce qui a failli faire « réparer » du code conforme à R20.

> **La feuille de style partagée déplace aussi le backoffice.**
> `packages/ui/src/styles/globals.css` est importée par les deux applications :
> la typographie d'`apps/admin` descend donc du même cran, alors que le
> périmètre annoncé est `ui` + `client`. Ses 409 tests passent et ses champs
> gagnent le plancher de 16 px, mais **ses écrans n'ont pas été mesurés**. C'est
> assumé, pas ignoré : le plan met l'échelle dans `packages/ui`, et deux
> échelles pour un seul système de design serait la dérive que cette étape
> ferme.

> **Le desktop n'est pas touché.** Chaque variante `md:`, `lg:` et `xl:` est
> laissée en place — la plainte comme le critère d'acceptation portent sur le
> téléphone, et faire bouger les deux à la fois aurait rendu la relecture
> impossible. Les grandes tailles (`text-5xl`, `text-[56px]`, `text-[3.375rem]`)
> sont toutes derrière une variante, sauf deux qui ont rejoint l'échelle.

> **La sonde de débordement a menti, encore.** Elle comptait quarante
> débordements, dont les cercles décoratifs de quatre heros. Or les quatre
> sections portent **déjà** `overflow-hidden` : ces cercles sont proprement
> coupés, donc invisibles. Un élément clippé par un ancêtre n'est une faute que
> s'il porte du **texte** — c'est du contenu coupé que parle le point 5, pas
> d'un flou décoratif volontairement débordé. Avec la règle corrigée : **zéro**.

> **Et le débordement a été comparé à une référence, pas jugé de mémoire.** Les
> modifications ont été remisées (`git stash`) et la sonde relancée sur six
> couples écran/largeur : le relevé est **identique** avant et après. R33
> n'introduit aucun débordement, ce qui était l'inquiétude légitime d'une étape
> qui change quinze tailles.

> **Deux vraies trouvailles, corrigées.** Le bouton « Publier une annonce » du
> bas de `/about` mesurait 42 px sans `touch-target` — la seule cible non
> conforme de la campagne. Et l'indice de survol de `listing-card` (« Voir → »),
> poussé par un `ml-auto`, dépassait le bord de la carte de 11 px à 320 px : il
> passe en `hidden sm:flex`, parce qu'un indice de survol ne rend rien sur un
> téléphone.

> **Deux puces de filtre d'une seconde forme, ramenées à la bonne hauteur.**
> §2.1 dit « une seule forme » ; `routes/posts/_index.tsx` et
> `settings/components/edit-zone-dialog.tsx` avaient chacune leur capsule à 35
> px avec son propre `py-2`. Les deux passent à `h-chip`. **Leur palette est
> laissée telle quelle** : les faire passer par `filterPillClassName` changerait
> aussi leurs couleurs actives, ce qui n'est pas une question de taille — reste
> ouvert.

> **Les liens au fil d'une phrase restent sous 44 px, et c'est correct.** Les
> six relevés restants sont « politique de confidentialité », « conditions
> d'utilisation » et « Se connecter », tous à l'intérieur d'un paragraphe. WCAG
> 2.5.8 exempte explicitement un lien en ligne dans du texte courant, et la
> règle de §2.1 vise un contrôle, pas un mot dans une phrase.

> **`--destructive-text` n'est pas posé.** La liste des dettes désigne R33 comme
> l'étape qui touche `packages/ui`, donc celle qui devait le faire. C'est une
> question de **couleur**, pas d'échelle : elle demande sa propre passe de
> contraste dans les deux thèmes et touche `field.tsx` plus chaque formulaire,
> alors que ce diff pèse déjà soixante-onze fichiers. Déclaré non fait, et non
> oublié.

> **Mesures.** Neuf écrans publics × 7 largeurs (320, 360, 375, 390, 393, 412,
> 430 — SE, Galaxy A/S, iPhone mini, iPhone 12-15, Pixel 7/8, Galaxy S20+,
> iPhone Pro Max), 2 870 relevés d'élément. **Sept tailles de police, zéro hors
> échelle.** **Zéro champ sous 16 px.** **Zéro débordement.** Zéro cible sous 44
> px hors liens en ligne. Typecheck 9/9, lint sans erreur, client **846/846**,
> admin **409/409**, `format:check` propre. Densité de commentaires **6,2 %**.

#### R34 — Gouttière de zones sûres unique

Ouverte par R16, rappelée par la relecture de R17, rendue par R23 : les zones
sûres cassaient la mise en page partout où personne n'y avait pensé. En paysage
sur un téléphone à encoche, la découpe mange une gouttière entière de chaque
côté.

**Mesuré (§1.1) — 111 constats sur la référence, 0 après.** Le critère
d'acceptation de cette étape était donné pour visuel et hors CI. Il ne l'est
plus : le protocole de Chromium sait **émuler les découpes**
(`Emulation.setSafeAreaInsetsOverride`, une sonde Playwright sur le build
servi). Posé `left: 44, right: 44, bottom: 21` à 844 × 390 — un téléphone à
encoche couché — et relevé tout élément **de contenu** dont la boîte franchit
une des deux bandes : texte propre, lien, bouton, champ, image. Un fond, une
bordure et un calque décoratif sont exclus, parce qu'ils **doivent** passer sous
la découpe.

|                          | Référence | R34   |
| ------------------------ | --------- | ----- |
| Écrans comparés          | 27        | 27    |
| Éléments sous la découpe | **111**   | **0** |
| Écrans touchés           | 25 sur 27 | 0     |

Le viseur caméra fait un vingt-huitième écran, mesuré sur R34 seul : il demande
la permission et un flux factice, et n'a donc pas de relevé de référence.

Et l'inverse a été vérifié aussi, parce que c'est le vrai risque d'un diff qui
touche seize écrans validés : sans découpe latérale — portrait 390 × 844 avec
`top: 47, bottom: 34`, puis bureau 1280 × 800 — la géométrie est **identique à
la référence, 0 différence sur 14 écrans × 2 formes**. Le changement est inerte
là où il n'y a rien à dégager, l'échange des insets verticaux compris.

**Recompté : seize fichiers et non quinze**, R25 ayant ajouté
`install-prompt.tsx`. Et sur ces seize, **six seulement** lisaient un inset
_latéral_ — la barre d'onglets, le hero, le bloc stickers et les trois pièces du
tunnel de publication. Les dix autres ne lisaient que le haut ou le bas : c'est
pourquoi la référence sortait 111 constats et non quelques-uns.

1. **Un seul point de lecture, dans `app/app.css`.** Quatre propriétés
   personnalisées — `--safe-top`, `--safe-right`, `--safe-bottom`, `--safe-left`
   — et une utilitaire `safe-x` par-dessus les deux latérales. Plus aucun
   `env(safe-area-inset-*)` ailleurs dans `apps/client` : les 24 occurrences
   deviennent 20 lectures de variable dans 20 fichiers — quatre disparaissent
   avec les doublons de l'accueil.
2. **La gouttière va sur l'élément qui peint le fond.** Un `padding` laisse la
   couleur, la bordure et l'ombre atteindre le bord de l'écran, et rentre le
   contenu. C'est ce qui permet de la poser sur l'en-tête collant, sur le pied
   de page, sur les barres fixes et sur les panneaux de feuille sans qu'aucun
   décor ne décolle du bord.
3. **Elle s'ajoute à la gouttière de base**, elle ne la remplace pas : le `px-4`
   de la page et le `px-6` de l'en-tête restent où ils sont. Les
   `max(1rem, env(…))` que R16 et R17 avaient posés sur l'accueil retombent donc
   à `px-4` — les garder compterait l'inset deux fois. Ceux du tunnel restent :
   le tunnel est **hors** de `routes/layout.tsx` et personne au-dessus ne porte
   sa gouttière.
4. **Cinq arbres, pas un.** Le point d'origine disait « une gouttière unique
   dans `routes/layout.tsx` ». `routes.ts` porte cinq racines de premier niveau
   — la coquille, `/q`, le tunnel, l'arbre d'authentification et `not-found` —
   et les barres fixes comme les feuilles échappent au `padding` de tout
   ancêtre. « Un seul point du code lit les insets » est donc tenu comme un
   point de **définition**, consommé par chaque racine, chaque barre et chaque
   feuille.

> **Trois écarts au périmètre annoncé, tous vers le haut.** Le plan nommait la
> coquille, l'accueil et le tunnel. La mesure a ajouté : les **six** feuilles
> inférieures (les cinq de R23 plus celle de R25), `contact-bar.tsx`, les deux
> barres du viseur caméra, l'arbre d'authentification et `not-found`. Aucun
> n'avait le moindre inset latéral.
>
> Deux nuances honnêtes. Les pages d'authentification **ne figuraient pas dans
> les 111 constats** : leur colonne de formulaire est étroite et centrée, donc
> son contenu n'atteint pas la découpe à 844 px. La gouttière y est défensive,
> pas corrective — mais le bandeau de marque, lui, s'affiche dès `md`, ce qui
> est exactement le barreau qu'un téléphone couché atteint. Et le viseur caméra
> a demandé sa propre passe : il faut la permission et un flux factice
> (`--use-fake-device-for-media-stream`) pour l'atteindre. Ses deux barres
> relèvent 44 px de chaque côté, 0 constat.

**Le critère entre en CI**, ce qu'aucune étape à critère visuel n'avait réussi —
et c'est le point de lecture unique qui le permet, puisqu'une propriété
personnalisée se pose depuis un test là où un `env()` ne s'émule pas.

- projet `node`, `shared/__tests__/safe-area.test.ts` : aucun fichier de `app/`
  hors `app.css` ne contient `env(safe-area-inset`, et les quatre variables sont
  bien définies. C'est la garde qui empêche le prochain écran d'en réécrire un.
- projet `ui`, `routes/__tests__/safe-area-gutter.test.tsx` : `safe-x` rend la
  découpe quand elle existe, **ne coûte rien** quand elle vaut zéro, et s'ajoute
  au `px-4` du contenu au lieu de l'écraser.

**Fichiers** : `apps/client/app/app.css`, `routes/layout.tsx`,
`components/{header,footer,bottom-tab-bar,install-prompt}.tsx`,
`routes/not-found.tsx`, `routes/q/_index.tsx`,
`routes/auth/{layout.tsx,components/branding-panel.tsx}`,
`routes/home/components/{hero-section,stickers-section}.tsx`,
`routes/posts/components/filter-sheet.tsx`,
`routes/posts/details/components/contact-bar.tsx`,
`routes/publish/components/{publish-header,publish-action-bar,publish-flow}.tsx`,
`routes/scan/components/{camera-view,activation-sheet}.tsx`,
`routes/account/posts/components/{listing-actions-sheet,matches-sheet}.tsx`,
`routes/account/stickers/components/sticker-actions-sheet.tsx`, plus les deux
suites. **Flux** : les cinq. **Acceptation** : aucun contenu sous la découpe en
paysage — **0 constat sur 28 écrans, contre 111 sur les 27 comparables** — et un
seul point du code lit les insets, désormais affirmé par un test.

### Lot 6 — Publier et scan public

#### R18 — Publication en trois étapes + brouillon

1. Découper en trois écrans : Objet → Où et quand → Contact.
2. Afficher les correspondances **à l'étape 2**, donc avant l'envoi : c'est
   l'argument principal, et il tombe aujourd'hui sous le formulaire.
3. Brouillon en `localStorage`, restauré à la reprise — un appel entrant efface
   actuellement sept champs et les photos.
4. Récapitulatif à l'étape 3, barre d'action basse à chaque étape.

**Fichiers** : `routes/publish/lost/`, `routes/publish/found/`,
`routes/publish/hooks/use-publish-form.ts`, `components/`. **Flux** : A, B.
**Acceptation** : la publication aboutit avec le même corps de requête
qu'aujourd'hui ; le brouillon survit à un rechargement. **Tests** : projet `ui`
sur le passage d'étape et la restauration.

> **Quatre arbitrages posés avant d'écrire une ligne**, la maquette contredisant
> le plan ou le dépôt sur chacun. (a) La bascule « J'ai perdu / J'ai trouvé »
> passe **dans** l'étape 1 et navigue entre les deux routes, qui gardent leur
> accent et leur action. (b) Le tunnel sort de `routes/layout.tsx`, comme
> `q/:code` : les planches n'ont ni header d'app ni barre d'onglets, et une
> barre d'action basse posée sous la barre d'onglets se volerait le tap avec
> elle. (c) Les trois étapes valent à **toutes** les largeurs — le canevas ne
> dessine aucun Publier desktop, et c'est le précédent de R10 (détail en une
> colonne partout) et de R17 (bento retiré partout) ; la barre latérale (jauge
> de complétion, conseils, correspondances) est abandonnée, ses trois rôles
> étant repris par les segments, l'étape 2 et la copie des planches. (d) Le
> champ « Repère (facultatif) » de `Publier2` n'est **pas** dessiné : aucune
> colonne ne le stocke, et §3 dit « données réelles ou rien ».

> ⚠️ **`/publish` reste montée**, contre l'arbitrage (a) tel qu'il avait d'abord
> été pris. La page de choix est la cible du (+) et de neuf autres liens ; la
> commenter transformait chacun en 404, ce que la relecture a vu tout de suite.
> La bascule de l'étape 1 reste : elle sert à changer d'avis sans revenir en
> arrière, au prix d'un choix offert deux fois.

> **La publication ne redirige plus vers l'annonce** mais vers **Mes annonces**.
> Une annonce naît `pending`, donc sa page publique répond 404 à la personne qui
> vient de l'écrire ; Mes annonces est le seul écran où elle existe, et la
> bannière que R11 y a posée dit déjà qu'un modérateur doit passer. Le corps de
> la requête, lui, est **inchangé** — c'est ce que l'acceptation demandait.

> **Huit écarts de rendu, consignés plutôt que subis.** (1) Neuf puces de
> catégorie, pas les six des planches, et « Documents » et non « Papiers » —
> §2.3 règle 2, R13 et R17. (2) Cinq photos, pas trois : `MAX_PHOTOS` est dans
> le contrat. (3) Le brouillon ne restaure **pas** les photos : un `File` meurt
> avec la page qui l'a choisi, aucun stockage ne le ressuscite. (4) Les trois
> étapes restent **montées**, l'inactive portant `hidden`, pour la même raison :
> démonter l'étape 1 détruirait les `<input type="file">` avant que l'étape 3
> n'envoie le formulaire. (5) Le raccourci de date (Aujourd'hui / Hier / Autre
> date) écrit le même `YYYY-MM-DD` que le sélecteur natif. (6) La carte de
> correspondances a **quatre** états, dont l'échec : `matching.loader` répond
> `null` quand l'API est injoignable, parce qu'une API muette lue comme « aucune
> correspondance » sert au posteur la réponse rassurante sans aucune preuve. (7)
> Le tunnel pose ses propres `env(safe-area-inset-*)` — **R34 doit les retirer
> avec ceux de R16 et R17**. (8) Les composants que la barre latérale employait
> restent sur disque sans être appelés (`publish-sidebar`, `form-progress`,
> `tips-panel`, `publish-form-actions`, `object-info-section`,
> `matching-suggestions`) : la jauge et les conseils sont des fonctions qui
> disparaissent, et la règle du dépôt est de commenter, jamais de supprimer.

> ⚠️ **Deux pièges payés dans le navigateur, tous deux invisibles au test.** (a)
> **Radix répond `onValueChange('')` au montage** d'un `Select` contrôlé qui
> part sans valeur. Pris au mot, le gestionnaire de ville lisait « la ville a
> changé » et vidait ville **et** commune d'un brouillon qu'on venait de
> restaurer. Garde posée sur les deux `Select` ; `location-date-section`, dont
> la valeur initiale n'est jamais vide, n'est pas touché et un test le prouve.
> (b) **`data-[size=default]:h-9` de shadcn ne cède pas à `h-13`** :
> tailwind-merge ne voit pas le conflit entre une classe à variante et une
> classe nue, donc les deux s'appliquent et la variante gagne. Mesuré à **36
> px**, sous le plancher de 44. Corrigé par `data-[size=default]:h-13`. ⚠️
> **`location-date-section` reste à 36 px** (`h-11`) sur la page de modification
> — dette antérieure, à reprendre avec R33.

> **Mesures.** Aucun débordement à 320/360/390/430/768/1024/1440 px, dans les
> deux thèmes, aux trois étapes et pour les deux types — soit 84 relevés. Aucune
> cible sous 44 px hors pied de page, sur 868 relevées. Plancher de contraste
> **4,56:1** hors dette. Les 126 relevés sous plancher sont **tous** la dette
> R13 — `text-destructive` à **2,98:1 en sombre**, sur l'astérisque de
> `InputLabel` et les messages de `FieldError`, communs à tous les formulaires
> du dépôt : `--destructive-text` manque toujours dans `packages/ui`, et c'est
> R33 qui touche ce paquet.

> ⚠️ **La sonde de contraste a encore menti**, d'une troisième façon, et ses
> autotests l'ont attrapée : un fond semi-transparent doit être **composité**
> sur ce qu'il y a derrière, et son alpha doit venir du **canal alpha du
> canvas**, jamais d'une regex — Chromium sérialise `oklab(1 0 0 / 0.95)`, où
> compter les nombres lit la clarté comme un canal et perd l'alpha. Signature :
> tous les ratios écrasés sur **1,22 et 3,52**, et l'en-tête à 95 % lu comme un
> noir opaque. La sonde porte désormais **trois** autotests — 17,28/18,98 (clair
> / sombre), 6,39 (aplat orange) et **5,24** (noir sur 50 % de noir au-dessus de
> blanc) — plus un compteur de couleurs que le canvas a refusées, qui doit
> valoir zéro.

> **Ouvert par R18 :** la publication des **documents d'identité**. La Côte
> d'Ivoire perd surtout des CNI, des permis de conduire, des cartes bancaires et
> des cartes d'assurance, et le formulaire n'a rien pour eux — voir **A7** et
> **R35**.

#### R19 — Refonte de la page de scan publique

1. Remplacer les couleurs codées en dur (`bg-gray-50`, `bg-white`) par les
   tokens : cet écran n'a aujourd'hui aucun mode sombre.
2. Passer les champs à 16 px — `text-sm` déclenche le zoom automatique d'iOS sur
   l'écran le plus exposé du produit.
3. Une action dominante (« Prévenir sur WhatsApp »), « Appeler » en second, le
   formulaire replié avec **un seul** champ obligatoire.
4. Conserver les trois états du token : activé, non activé, révoqué.

**Fichiers** : `routes/q/_index.tsx`, `components/qr-contact-form.tsx`,
`components/qr-owner-card.tsx`. **Flux** : B. **Acceptation** : aucune couleur
littérale ; le zoom iOS ne se déclenche plus.

> ⚠️ **Le point 3 n'est pas constructible, et le plan comme la maquette se
> contredisent eux-mêmes dessus.** « Prévenir sur WhatsApp » et « Appeler »
> exigent le numéro du propriétaire. L'API ne le publie pas, et c'est délibéré :
> `GetQrTokenPublicViewUseCase` dit « the owner's first name, **never the
> account** », et `/qr-codes/:code/scan` est `@AllowAnonymous()` sur un code
> énumérable, **sans aucune limitation de débit** dans le dépôt — y exposer un
> numéro le rend moissonnable. Surtout, la maquette promet deux fois l'inverse :
> `ScanQR` écrit « Le numéro du propriétaire ne vous est jamais montré » et
> `ScanActivation` le redit au propriétaire, « sans jamais voir votre numéro ».
> Or **ni `wa.me` ni `tel:` ne peuvent tenir cette promesse** — WhatsApp et le
> clavier d'appel affichent le numéro d'un contact inconnu. Les deux boutons
> sont donc **reportés à A8**, qui tranchera le consentement du propriétaire et
> plafonnera le débit avant d'ouvrir quoi que ce soit ; R19 reste front-only
> comme son périmètre l'annonce et livre les points 1, 2 et 4. « Envoyer le
> message » est l'action dominante en attendant, et la promesse affichée est
> alors **vraie**, ce qu'un test vérifie.

> **Le formulaire ne descend pas à un seul champ obligatoire.**
> `contactOwnerSchema` exige nom, numéro et message, et `ContactMessage.name`
> est `NOT NULL` : l'assouplir serait une migration plus un changement de
> contrat et d'API, donc hors du périmètre déclaré. Arbitrage retenu : **on ne
> replie jamais un champ obligatoire** — un formulaire qui répond « ce champ est
> requis » sur un champ qu'il cache est un piège. Le message passe donc en tête,
> seul, sous le libellé de la maquette (« Où peut-il le récupérer ? » + «
> Obligatoire ») ; nom et téléphone restent visibles sous un intertitre ; seul
> l'email, réellement facultatif, est replié derrière « Ajouter un email
> (facultatif) ». Ce repli **s'ouvre de lui-même** si une erreur serveur tombe
> sur l'email, sans quoi le message serait injoignable.

> **Six écarts de rendu, consignés plutôt que subis.** (1) Le titre de la
> maquette (« Merci ! Cet objet appartient à Konan ») devient le `h1` et se
> replie sur « quelqu'un » quand le compte n'a pas de prénom — les deux cas
> viennent du même champ nullable. (2) Ce même `h1` porte l'état pour un sticker
> non activé ou révoqué, et la note en dessous ne fait plus qu'expliquer :
> l'ancienne paire titre + note disait deux fois la même chose. (3)
> `QrOwnerCard` ne dessine **rien** quand le propriétaire n'a nommé ni le
> sticker ni l'objet, au lieu d'une carte vide. (4) Les libellés en capitales
> passent à `text-xs` : §2.1 retire `text-[10px]` et `text-[11px]`, que la
> maquette emploie à 10,5 px. (5) Le lien-logo de l'en-tête mesurait **32 px** —
> porté à 44, §2.1 ne souffre aucune exception sous `lg`. (6) La ligne « Le
> numéro du propriétaire ne vous est jamais montré » n'apparaît que sur l'écran
> activé : sur un sticker qu'on ne peut pas contacter, elle promettrait quelque
> chose au sujet d'un formulaire absent.

> **Mesures.** Aucun débordement sur **70 passages** — 320/360/390/430/768/1024/
> 1440 px, deux thèmes, les cinq états du token (activé, activé sans prénom ni
> libellé, non activé, révoqué, textes longs). **Aucun champ sous 16 px**, ce
> qui est l'acceptation de l'étape. Aucune cible sous 44 px hors pied de page.
> Plancher de contraste **5,03:1** sur 826 relevés, **zéro** sous plancher. Les
> états qui n'existent qu'après interaction ont été mesurés à part (erreurs,
> email déplié) : 222 relevés, dont **18 sous plancher — tous la dette R13**,
> `text-destructive` à **2,82:1 en sombre** sur les messages de `FieldError`.
> `--destructive-text` manque toujours dans `packages/ui`, et **R33** est
> l'étape qui touche ce paquet. Les quatre autotests de la sonde sortent exacts
> (17,28 / 18,98 / 6,39 / 5,24) et le compteur de couleurs refusées vaut zéro.

> ⚠️ **Piège de test payé par R19 :** `cleanup()` appelé **au milieu** d'un test
> de la suite `ui` vide le conteneur pour de bon — les douze tests suivants
> échouent sur un `<body>` vide, avec un avertissement « overlapping act() calls
> » pour seul indice. Deux rendus dans un même `it` ne se rattrapent pas : il
> faut deux `it`.

### Lot 7 — Scanner QR

#### R20 — Écran caméra et amorce de permission

1. Route `/scan` et écran plein cadre : viseur, torche, fermeture.
2. **Amorce avant toute demande système** : un écran qui explique l'usage, puis
   `getUserMedia` au tap. Un refus est durable.
3. Décodage par `BarcodeDetector` quand il existe.
4. Analyseur unique acceptant l'URL complète (`https://…/q/RCI-XXXXXX`) et le
   code nu ; normalisation de la casse et des tirets ; refus explicite d'un QR
   étranger.
5. Un sticker activé qui n'est pas le vôtre ouvre `/q/:code` — pas une variante.

**Fichiers** : nouveaux `routes/scan/`, `app/routes.ts`, plus
`@app/contracts/qr-codes` et `api/qr-codes` (voir plus bas). **Flux** : B, C.
**Acceptation** : aucune demande de permission au chargement d'une page.
**Tests** : projet `node` sur l'analyseur (URL, code nu, casse, QR étranger).

> **Le format du code n'est celui d'aucune des trois sources.** Ce plan écrivait
> `RCI-XXXX-XXXX`, `note-scan-tech` écrit `RCI-XXXX`, l'artboard `Scanner`
> annonce « le code à huit caractères » et R15 cite `RCI-4A7F-2K91`. Le
> générateur, lui, produit `RCI-` **plus six** caractères tirés de
> `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` — ni I, ni O, ni 0, ni 1, pour qu'un code
> lu à voix haute ou recopié ne soit jamais ambigu. Dix caractères en tout. Le
> point 4 est corrigé ci-dessus, et l'écran ne compte aucun caractère à voix
> haute : il dit « le code est imprimé sous le QR », qui reste vrai le jour où
> la longueur change.

> **Les deux constantes remontent dans `@app/contracts/qr-codes`.** Le périmètre
> annonçait `routes/scan/` seul, mais l'analyseur doit connaître le préfixe et
> la longueur, et `QR_CODE_PREFIX` / `QR_CODE_RANDOM_LENGTH` vivaient dans
> `apps/api/src/domains/qr-codes/constants.ts`, que le client ne peut pas
> importer. Les recopier aurait remis en place exactement la dérive qu'E6 a
> passé une époque entière à tuer : une règle, deux écritures. Elles sont donc
> dans `qr-codes.const.ts`, `generate-qr-code.ts` les lit de là, et le fichier
> `constants.ts` disparaît. Le générateur et l'analyseur ne peuvent plus
> diverger.

> **L'analyseur ne vérifie pas l'hôte de l'URL.** Une URL en `/q/<code>` est
> acceptée quelle que soit son origine. L'origine imprimée diffère entre la
> production, une préproduction et un téléphone braqué sur un portable, et
> refuser dessus casserait le scanner partout sauf en production. Ce qui est
> refusé, c'est tout ce qui ne mène pas à un code de la bonne forme —
> `https://retrouve.ci/posts/RCI-ABC123` compris.

> **`/scan` reste dans la coquille ; seul le viseur passe en plein cadre.**
> L'artboard `Scanner` dessine un écran sans en-tête ni onglets, ce qui se lit
> comme une route hors coquille façon tunnel de publication (R18). Mais l'amorce
> et la saisie du code sont du contenu de page ordinaire avec **une** action
> dominante, et sortir la route ferait disparaître l'onglet Scanner à l'instant
> même où on le touche. La caméra vivante, elle, est en `fixed inset-0`
> par-dessus la barre d'onglets, et son ✕ ramène à l'amorce.

> **Un navigateur sans `BarcodeDetector` n'ouvre pas la caméra du tout.** Le
> point 3 dit « quand il existe » sans dire ce qui se passe sinon. Safari n'en a
> pas et le décodeur WASM n'arrive qu'à R21 : ouvrir un viseur vivant qui ne
> lira jamais rien coûterait une permission — durable — pour une fonction qui ne
> rend rien. L'amorce bascule donc directement sur l'état « la lecture
> automatique n'est pas disponible » de l'artboard `ScanPermission`, avec la
> saisie du code en action dominante. R21 remplace cette branche.

> **Le point 5 est satisfait par construction, et ne coûte rien.** À cette
> étape, _tout_ code lu part sur `/q/:code`, propriétaire ou non : le scanner
> n'a aucune variante à ne pas créer. C'est R22 qui introduira le partage, et
> l'invariant du flux B devra y être revérifié — pas ici.

> **Le voile plat de la maquette ne tient pas sur un sticker blanc.** L'artboard
> pose du texte blanc sur un voile à 45 % au-dessus d'une scène **sombre**
> dessinée. Une caméra vise du papier blanc au moins aussi souvent : mesuré sur
> une scène blanche, le blanc sur ce voile tombe vers 1,5:1, illisible.
> L'habillage du viseur est donc reposé en **aplats** — bandes haute et basse à
> 85 % et pastille centrale à 85 % — en laissant le centre à 25 % là où l'on
> vise. Mesuré sur scène blanche : **12,51:1 au plancher** sur 140 relevés.

> **Le viseur verrouille le défilement et se ferme par Échap.** Non dessiné, et
> pourtant : un plein cadre `fixed` au-dessus d'une coquille qui continue de
> défiler, c'est deux écrans à la fois sur un téléphone. `aria-modal` seul ne
> l'empêche pas.

> **La saisie du code passe à react-hook-form + Zod.** R6 l'avait écrite en
> `useState`, ce que les conventions du client interdisent depuis E7. Le schéma
> est local (`scan.schema.ts`) et non dans les contrats : il ne garde aucune
> règle métier propre, il appelle l'analyseur.

> **`.touch-target` étend la zone tactile par pseudo-élément.** Elle n'a rien à
> réparer. La première sonde a signalé le lien-logo de l'en-tête partagé à 137 ×
> 31 px sur toutes les largeurs, ce qui ressemblait au défaut que R19 avait
> corrigé sur son propre en-tête. C'en est l'inverse : `.touch-target` pose un
> `::before` de `max(100%, 44px)` sous `lg` et le retire à `lg`, donc la boîte
> **dessinée** n'est pas ce que le doigt atteint. Toute sonde de cibles doit
> créditer cette classe, sous peine de faire « réparer » du code conforme.

> **La sonde de contraste lisait le viseur sur du noir.** Elle remontait la
> chaîne des **ancêtres**, or la vidéo et le voile sont des **frères** : ni l'un
> ni l'autre n'était compté, et l'écran caméra sortait à 19,8:1 pendant que le
> vrai chiffre était sous 2. Elle lit maintenant l'empilement par ordre de
> peinture (`elementsFromPoint`, fond de l'élément lui-même inclus, descendants
> exclus) et **écarte tout élément couvert** — ce qui règle du même coup les 220
> fausses cibles de l'en-tête que le viseur recouvrait. Deux passes caméra, sur
> scène noire et sur scène blanche.

> **Mesures.** 84 passages : 7 largeurs (320→1440) × 2 thèmes × 6 états (amorce,
> saisie, saisie en erreur, caméra indisponible, viseur sur scène noire, viseur
> sur scène blanche). **0 débordement sur 84.** **0 cible sous 44 px sous
> `lg`.** **0 champ sous 16 px** sur la page. Contraste : 1 878 relevés, **61
> sous plancher, tous connus** — 54 pour le logotype « CI » (dispensé) et 7 pour
> `text-destructive` en sombre. Autotests de la sonde **4/4 exacts**, 0 couleur
> refusée par le canvas.

> **Dette mesurée, hors périmètre.** `text-destructive` sur `bg-card` en sombre
> vaut **2,98:1** et produit les 7 relevés de page — c'est la dette R13, et
> **R33** est l'étape qui touche `packages/ui`. Le champ de recherche de
> l'en-tête desktop est à **14 px** dès 768 px, donc sur une tablette où §2.1
> demande 16 px (R7/R17). Et `bottom-tab-bar.tsx` garde un `text-[11px]` que
> §2.1 déclare inexistant (R6) — pour R33 également.

> **Deux nouveaux `env()` locaux, pour R34.** Le viseur est en `fixed inset-0` :
> il lit `safe-area-inset-top` en haut et `safe-area-inset-bottom` en bas. R34
> devra les reprendre avec ceux de R16, R17, R18 et R19.

#### R21 — Décodeur WASM et repli photo

1. Import dynamique du décodeur WASM, **chargé à l'ouverture du scanner
   uniquement** : `BarcodeDetector` n'existe pas sur Safari, et sur un forfait
   compté ce chargement paresseux n'est pas une optimisation mais la condition
   d'acceptabilité.
2. Repli universel `<input type="file" accept="image/*" capture="environment">`.
3. Saisie manuelle du code atteignable depuis chaque état d'échec, avec
   formatage automatique des tirets.

**Fichiers** : `routes/scan/`. **Flux** : B, C. **Acceptation** : le scan
aboutit sur iOS Safari ; aucun octet de décodeur chargé tant que le scanner
n'est pas ouvert.

> **Le décodeur est `barcode-detector` posé sur `zxing-wasm`, et il ne se charge
> que là où il manque.** Les trois candidats ont été pesés avant de choisir : le
> `.wasm` de lecture fait 459 Ko gzip plus 17 Ko de glue, quand `jsqr` en pur
> JavaScript en ferait une vingtaine. Ce qui tranche, c'est que l'import reste
> conditionnel — Chrome Android répond avec son `BarcodeDetector` natif et ne
> télécharge rien du tout ; seul Safari paie, une fois. `barcode-detector`
> expose exactement l'interface `detect()` que R20 avait déjà déclarée, donc un
> seul chemin de code au lieu de deux, et ZXing lit un sticker abîmé bien mieux
> que jsQR, qui n'a plus de version depuis 2021.

> **L'acceptation est vérifiée sur l'artefact de build, pas sur l'intention.**
> La route `/scan` précharge dix-neuf chunks, dont aucun n'est le décodeur ni le
> binaire ; la seule trace de zxing dans le chunk de la route est l'URL de
> l'asset, quarante octets ; et le module n'est atteint que par
> `import("./ponyfill-…js")`, sans qu'aucun chunk ne l'importe statiquement.

> **Le binaire est servi depuis notre origine.** `zxing-wasm` va le chercher sur
> un CDN par défaut : `setZXingModuleOverrides({ locateFile })` le fait pointer
> sur l'asset que Vite émet. Deux raisons, et la seconde est structurante :
> aucun tiers n'a à voir passer un scan, et le service worker de R24 ne pourra
> précacher que ce que nous servons nous-mêmes. C'est ce qui met `zxing-wasm`
> dans le catalogue, épinglé exactement à la version que `barcode-detector`
> épingle — une glue et son binaire ne se désynchronisent pas.

> **Seul le chargement du module est mémorisé, jamais le détecteur.** Mettre en
> cache l'instance aurait figé le premier verdict : un navigateur qui gagne un
> `BarcodeDetector` natif en cours de session aurait continué sur le WASM, et
> surtout un échec de chargement se serait gravé pour toute la session, alors
> que la cause probable est l'absence de réseau. Construire un détecteur sur un
> module déjà chargé ne coûte rien. C'est aussi ce qui rend les tests
> indépendants de leur ordre.

> **La caméra est demandée avant le décodeur, et le flux est retenu entre les
> deux.** La boîte de dialogue système doit suivre le tap, pas un téléchargement
> d'un demi-mégaoctet. Le flux est donc rangé dans sa `ref` avant le second
> `await`, sinon quitter la route pendant le chargement laisserait la caméra
> allumée derrière soi.

> **`unsupported` change de sens.** Ce n'est plus « ce navigateur ne sait pas
> lire un QR code » — R21 en donne un à tout le monde — mais « le décodeur n'a
> pas pu être chargé ». Le texte de l'écran le dit désormais, et c'est la seule
> raison contre laquelle le repli photo n'est **pas** proposé : il a besoin du
> décodeur qui vient d'échouer, donc ce serait un bouton mort.

> **Le repli photo ne vit que dans l'état bloqué**, comme l'artboard
> `ScanPermission` le dessine. Pas sur l'amorce, qui n'a qu'une seule action
> dominante. Pas dans le viseur non plus, où une photographie ne lit pas mieux
> qu'un flux vivant et où la saisie du code répond déjà au sticker abîmé.

> **L'échec de lecture est passager en caméra, plein panneau en photo.**
> L'artboard `ScanRepli` dessine son état 1 en feuille par-dessus le viseur,
> sans dire d'où il vient. La caméra lit tout ce qui passe devant elle : sortir
> du viseur à chaque QR étranger croisé — une affiche, un mur de flyers — serait
> hostile, et coûterait sur certains navigateurs une nouvelle demande d'accès.
> Le repli photo, lui, n'a pas d'image suivante à essayer tout seul : c'est là
> que l'état dessiné prend son sens. Un troisième message a été ajouté pour la
> photo qui ne porte aucun QR — le cas du sticker abîmé que le texte de
> l'artboard nomme mais ne dessine pas.

> **Le champ segmenté de l'artboard décrit un code qui n'existe pas.**
> `RCI — 4A7F — ••••` et « le code à huit caractères » reprennent le format que
> R20 avait déjà démonté : le générateur produit `RCI` plus **six** caractères,
> un seul tiret. Tout le « formatage automatique des tirets » du point 3 se
> réduit donc à ce tiret-là. Le masque met en majuscules, jette ce qu'un clavier
> de téléphone ajoute, insère le tiret après `RCI` et s'arrête à dix caractères.

> **Une URL collée échappe au masque.** Une valeur qui contient une barre
> oblique est laissée telle quelle : le masque garderait l'hôte et jetterait le
> code. Le champ accepte un lien de scan collé — c'est la seule chose qu'un
> visiteur sur ordinateur puisse coller — et `parseStickerCode` le lit entier à
> la soumission, sans avoir bougé, comme prévu.

> **Le WASM ne se charge pas en test, et c'est délibéré.** Un mégaoctet de
> binaire par exécution pour n'affirmer rien à son sujet : `barcode-detector`
> est remplacé par un module factice, qui est aussi ce qui permet à un test de
> dire que le décodeur a échoué. La règle de R20 tient toujours — Chromium de
> build n'a pas de `BarcodeDetector`, donc son absence se pose explicitement.

> **La sonde de contraste lisait encore l'en-tête sous le viseur.**
> `elementsFromPoint` renvoie la pile **entière**, éléments recouverts compris :
> y figurer ne prouve donc rien. La règle de R20 doit se lire sur le **sommet**
> de la pile, pas sur la présence. Avant correction, les passes du viseur
> sortaient dix-huit relevés sous plancher, tous le logotype de l'en-tête que le
> plein cadre recouvre.

> **Et la sonde de champs comptait un champ large de zéro pixel.** Un ancêtre
> `hidden md:block` ne touche pas au `display` de l'`input` lui-même : la
> recherche de l'en-tête ressortait à toutes les largeurs, quatre-vingt-quatre
> relevés pour quarante-huit réels. C'est la boîte, pas le `display`, qui dit si
> un élément est à l'écran.

> **Mesures.** 112 passages : 7 largeurs (320→1440) × 2 thèmes × 8 états
> (amorce, saisie, saisie en erreur, caméra refusée avec repli photo, échec de
> photo, décodeur introuvable, viseur sur scène noire, viseur sur scène
> blanche). **0 débordement sur 112.** **0 cible sous 44 px sous `lg`.** **0
> champ de page sous 16 px.** Contraste : 1 760 relevés, **59 sous plancher,
> tous connus** — 52 pour le logotype « CI » (dispensé) et 7 pour
> `text-destructive` en sombre. Le viseur seul : 140 relevés, **12,51:1 au
> plancher, 0 sous plancher** — le chiffre exact de R20, donc aucune régression
> sur un habillage dont le balisage n'a pas bougé. Autotests de la sonde **4/4
> exacts**, 0 couleur refusée par le canvas. **Tests : +14 (832 → 846).**

> **Dette mesurée, hors périmètre.** Le champ de recherche de l'en-tête desktop
> reste à **14 px** dès 768 px (48 relevés), et `text-destructive` sur `bg-card`
> en sombre reste à 2,98:1 : les deux sont pour **R33**.

> **Aucun nouvel `env()`.** R18, R19 et R20 en avaient chacune ajouté ; R21
> n'ajoute rien, donc la liste que R34 devra reprendre ne grandit pas.

#### R22 — Activation de stickers en série

1. Feuille d'activation après lecture : nommer l'objet, lier une annonce
   (facultatif), activer.
2. « Scanner le suivant » enchaîne — c'est tout l'intérêt sur un pack de douze.
3. Les trois surfaces de mise en avant, toutes **conditionnelles** : bandeau
   d'accueil tant qu'il reste des stickers inactifs, compteur dans Mes stickers,
   raccourci `shortcuts` du manifeste (R23).

**Fichiers** : `routes/scan/`, `routes/account/stickers/`,
`routes/home/components/`. **Flux** : C. **Acceptation** : activer douze
stickers ne demande jamais de saisir un code.

> **Mesuré (§1.1) : un jeton en attente n'a pas de propriétaire.**
> `createMany()` n'écrit que `code` et `batch`, et `activate()` est le **seul**
> endroit qui pose `userId`. Donc `GET /qr-codes/mine?status=generated` renvoie
> toujours une liste vide, et trois choses livrées par R15 étaient mortes-nées :
> `buildRemainingLabel()` répondait toujours `null`, la barre d'activation était
> **toujours à 100 %**, et le filtre « En attente » était **toujours vide**. La
> seule trace des stickers qu'un visiteur possède est `StickerOrder.quantity`
> sur ses commandes livrées, et il n'existe **aucune relation** entre
> `StickerOrder` et `QrToken`. R22 répare les trois.

> **Un point d'entrée de résumé, composé, et non deux.** Le numérateur est dans
> `qr-codes`, le dénominateur dans `sticker-orders`. La règle « un use-case n'en
> appelle jamais un autre » de `CLAUDE.md` vaut **à l'intérieur** d'un domaine :
> `ContactQrTokenOwnerUseCase` injecte déjà `CreateContactMessageUseCase` et
> `CreateNotificationUseCase`. `GET /qr-codes/mine/summary` suit ce précédent et
> injecte un `CountDeliveredStickersUseCase`, ce qui coûte **un** aller-retour
> au lieu de deux — à l'accueil comme sur Mes stickers.
> `StickerOrdersDomainModule` n'importe rien, donc aucun cycle.

> **Le résumé n'ajoute aucun schéma de contrat.** Le précédent
> `/lost-items/mine/summary` n'en a pas non plus : un résumé ne prend pas
> d'entrée, et la forme de sa réponse se type dans `shared/types/` du front.
> `packages/contracts` est tout de même touché, pour une autre raison — voir les
> plafonds ci-dessous.

> **`delivered` est planché sur `activated`.** Un sticker activé hors d'une
> commande à soi — un cadeau, un remplacement émis par le backoffice — rendrait
> `pending` négatif et ferait lire « 3 sur 0 » à la barre. Le use-case fait la
> soustraction une seule fois, côté serveur, et la borne à zéro.

> **La pastille « En attente » est retirée de Mes stickers.** Un onglet vide par
> construction promet une liste que rien ne peut remplir. Il en reste trois : «
> Tous », « Actifs », « Désactivés » — cette dernière n'est pas dans la maquette
> non plus, mais c'est le cas inverse, sans elle un sticker révoqué n'est
> joignable que depuis « Tous ».

> **Une seule carte de synthèse, là où la maquette dessine une carte par sticker
> en attente.** `MesStickers` et `ScanMiseEnAvant` dessinent tous deux une ligne
> « Sticker non activé / Scannez-le pour le nommer » : impossible, un sticker ne
> devient la ligne de quelqu'un qu'en s'activant. Une carte porte le lot entier
> — « 9 stickers en attente » — et mène au scanner. Elle ne s'affiche que sous «
> Tous » : un filtre d'état ne doit pas cacher le lot.

> **Deux dénominateurs sur un même écran, et c'est voulu.** Les pastilles
> comptent la **liste** (`Tous · 4`), la barre compte le **paquet acheté**
> (`3 sur 12 activés`). Les deux réponses sont justes à des questions
> différentes, et les confondre demanderait de mentir sur l'une des deux.

> **« Lier à une annonce » n'est pas livré comme un lien.** `linkedObject` est
> un `String?` libre de 120 caractères, sans relation vers `LostItem`, et R15 a
> déjà nommé cette colonne « Description de l'objet (optionnel) » : la
> rebaptiser ferait dire deux choses à une colonne (§2.3 règle 1). La feuille
> garde `label` comme champ dominant — « Sur quel objet le collez-vous ? », le
> nom que verra celui qui scanne — plus la description libre. **A9** est ouverte
> pour la vraie relation : colonne `lostItemId`, migration, contrat, résolution
> côté `/q/:code`.

> **Les plafonds de texte libre étaient plus larges devant que derrière.** Les
> deux fronts bornaient `label` à 80 et `linkedObject` à 140, contre les 60 et
> 120 que l'API applique : un nom de soixante-dix caractères passait le
> formulaire et revenait en « Validation failed » sans rien sur le champ. Les
> deux valeurs vivent désormais dans `qr-codes.const.ts`, lues par le schéma du
> contrat **et** par les deux formulaires. C'est le seul motif d'entrée de
> `packages/contracts` dans cette étape.

> **Le contrôle de statut ne tourne que si une session existe.** Celui qui
> **trouve** un objet n'a pas de compte et n'a rien à activer : son scan coûte
> exactement ce qu'il coûtait avant R22, une navigation. Mesuré au navigateur :
> **0 requête** de statut pour un visiteur anonyme, **1** pour un visiteur
> connecté.

> **Le statut se lit dans une route ressource, pas dans un loader de page.** La
> question se pose par code lu, pas par navigation, donc `scan/status` suit la
> forme de `publish/matches` et de `account/posts/matches`. Elle renvoie le code
> **avec** le statut : React Router rend un nouvel objet par chargement, et
> c'est cette identité qui distingue une réponse de la précédente — rescanner le
> sticker qu'on vient d'activer doit redemander, pas réutiliser « generated ».
> `null` veut dire « va sur `/q/:code` », API injoignable comprise : l'écran de
> contact est la destination honnête d'un code dont on ne sait pas lire l'état.

> **R22 introduit la première variante du flux B, et l'invariant tient quand
> même.** §2.2 dit que `/q/:code` est le **seul** écran de contact. La feuille
> ne contacte personne : elle nomme un objet que le visiteur possède. La règle
> forcée est donc `generated` **et** session ⇒ feuille ; tout le reste — activé,
> révoqué, illisible, ou visiteur anonyme ⇒ `/q/:code`, inchangé. Vérifié au
> navigateur sur les trois branches.

> **Le flux caméra reste ouvert, la détection est mise en pause.** Le même QR
> reste devant l'objectif tant que le téléphone y est, et la détection ne
> s'arrête qu'au rendu suivant : sans garde, le premier sticker lançait une
> requête toutes les 200 ms. La première lecture gagne, puis la détection
> s'arrête et le flux reste ouvert — la permission est déjà accordée, donc une
> réouverture n'achèterait qu'une image noire entre chaque sticker. Mesuré :
> **une seule ouverture de caméra pour douze stickers**, et **exactement 12**
> activations reçues par l'API.

> **La feuille gagne un état de succès que la maquette ne dessine pas.**
> `ScanActivation` place « Scanner le suivant » sous « Activer ce sticker »,
> c'est-à-dire « passe celui-là ». Après une activation réussie il faut dire ce
> qui s'est passé, et un paquet fait douze : « Scanner le suivant » devient
> l'action dominante, « Terminer » la seconde, et c'est elle seule qui part vers
> Mes stickers. Balayer la feuille équivaut à « Scanner le suivant » — être
> renvoyé sur un autre écran pour avoir fermé une feuille serait une surprise.

> **Le scanner passe en action première sur Mes stickers.** R15 l'avait mis en
> secondaire avec un commentaire disant « jusqu'à R20 » ; R20 et R21 n'activent
> pas, c'est R22 qui active. Le champ de saisie reste, à un tap, sous la forme «
> ou saisir un code à la main » que dessine `MesStickers`.

> **Le bandeau se sert dans le loader d'accueil, au-dessus du hero.**
> `homeLoader` ne prenait aucun argument et ne touchait jamais la session : il
> gagne `request` et n'appelle l'API que si une session existe. Un échec du
> résumé — API injoignable, contrôle de session qui lève — retire le bandeau et
> **jamais** la page : c'est le premier écran du produit. Le bandeau est
> au-dessus du hero comme la maquette le dessine, et il disparaît de lui-même à
> la douzième activation, sans que personne ne le ferme.

> **Un `env()` de plus pour R34.** La feuille d'activation lit
> `env(safe-area-inset-bottom)`, comme les quatre feuilles inférieures déjà
> recensées. La liste que R34 devra reprendre gagne donc une entrée.

> **Mesures.** 42 passages : 7 largeurs réelles (320, 360, 375, 390, 393,
> 412, 430) × 2 thèmes × 3 écrans (accueil avec bandeau, Mes stickers, feuille
> d'activation ouverte). 894 relevés. **6 tailles de police, toutes sur les sept
> barreaux de R33, 0 hors échelle.** **0 champ sous 16 px** — la feuille est à
> 16 px et 48 px de haut. **0 cible sous 44 px sous `lg`.** **0 débordement de
> page.** Contraste : **1 seul relevé sous plancher, le logotype « CI »** (2,7:1
> en clair, dispensé), et il est **identique à la référence** — `git stash` puis
> relance sur les deux écrans comparables donne les mêmes 16 débordements
> intra-défileur et le même unique échec, aux caractères près. Autotests de la
> sonde **4/4 exacts** (17,28 clair · 18,98 sombre · 6,39 · 5,03), **0 couleur
> refusée par le canvas**. Les nouvelles surfaces, dans les deux thèmes :
> bandeau **17,93:1** titre et **12,09:1** sous-titre (identiques en clair et en
> sombre, la surface sombre tient), son action **6,39:1** à 48 px ; compteur
> **17,28 / 18,98** ; « Scanner un sticker » **5,03:1** à 48 px ; pastilles à
> **34 px** ; feuille **4,93:1** au plancher (la pastille « NON ACTIVÉ »).
> **Acceptation vérifiée au navigateur : douze stickers activés d'affilée, douze
> codes distincts reçus par l'API, 0 champ de code saisi à la main.** **Tests :
> +34 côté client (846 → 880) et +7 côté api (372 → 379).**

> **Le recouvrement des cibles tactiles baisse, et rien de neuf n'apparaît.**
> 371 cibles comparées sur les trois écrans × 7 largeurs, chaque zone étendue à
> 44 px autour de son centre quand elle porte `.touch-target` : **32 paires qui
> se recouvrent, contre 73 dans la référence, et toutes les 32 y figurent
> déjà**. Retirer la pastille « En attente » enlève un renvoi à la ligne, et la
> carte de synthèse écarte « Commander d'autres stickers » de la barre d'onglets
> — un recouvrement de 9 à 12 px que la référence portait à toutes les largeurs
> disparaît. Ce qui reste est connu : le pied de page (12 px, dette recensée) et
> deux paires de pastilles à 2 px quand la rangée passe à la ligne, `h-chip`
> valant 34 px pour un tap étendu à 44. L'écart sous l'action première de Mes
> stickers est laissé à 16 px et non aux 8 px de la maquette, sans quoi la zone
> du lien « saisir un code à la main » mordrait sur le bouton.

> **Les tests d'admin `administrators-page` flanchent aussi sous charge
> parallèle.** Deux d'entre eux tombent dans un `pnpm run test --force` à la
> racine et passent seuls, comme les « gates on the session » et
> `contact.action.test.ts` déjà connus. Ce n'est pas une régression : R22 ne
> touche pas `apps/admin`.

### Lot 8 — PWA

#### R23 — Manifeste, icônes et couleurs de thème

1. `manifest.webmanifest` : `display: standalone`, `start_url: /`, `lang: fr`,
   `theme_color`, et `shortcuts` vers Scanner, Publier et Rechercher.
2. Icônes 192 et 512, une variante `maskable` avec marge de sécurité, un
   `apple-touch-icon` 180 — `public/` ne contenait que `logo.png`.
3. Une couleur de barre par thème, déclarée une fois dans `root.tsx` plutôt que
   répétée dans chaque `pageMeta()`.
4. Remplacer `OG_IMAGE` par une image 1200×630 — le partage WhatsApp d'une
   annonce est une boucle centrale du produit.

**Fichiers** : `apps/client/public/`, `app/root.tsx`,
`app/shared/helpers/page-meta.ts`, `app/shared/helpers/theme.ts`,
`app/context/theme.tsx`. **Flux** : tous. **Acceptation** : l'app est déclarée
installable par le navigateur. **Tests** : projet `node` sur le manifeste, les
actifs qu'il nomme et les balises de `root.tsx` (17 cas) et sur `pageMeta` (5
cas) ; projet `ui` sur la couleur de barre qui suit une bascule de thème (2
cas).

> **Mesuré : l'acceptation ne dépend pas de R24.** Chromium ne réclame plus de
> service worker pour déclarer une app installable. Sur le build servi, **zéro
> erreur d'installabilité**, zéro erreur d'analyse du manifeste — et la sonde a
> nommé, dans la même exécution, les quatre refus qu'elle sait produire :
> `manifest-missing-name-or-short-name`, `manifest-display-not-supported`,
> `no-acceptable-icon`, `no-manifest`. La chaîne R1 → R23 → R24 tient toujours,
> mais c'est pour le hors-ligne, plus pour l'installabilité.

> **La sonde d'installabilité mentait en headless**, et il faut le savoir avant
> R24 et R25. `Page.getInstallabilityErrors` renvoie `[]` pour **tout** en
> headless classique, y compris un manifeste `display: browser` sans nom : la
> machinerie d'installation n'y tourne pas. Il faut un Chromium **avec tête**
> sous `xvfb-run`, et un **profil persistant** — un contexte éphémère ajoute
> `in-incognito` à chaque relevé. Cinq cas dégradés doivent sortir juste avant
> qu'un verdict positif vaille quoi que ce soit.

> **Seize écarts consignés.**
>
> 1. **Une seule balise `theme-color`, pilotée, contre les deux du point 3.** Le
>    point demandait `media="(prefers-color-scheme: …)"`, mais le thème a
>    **trois** états gouvernés par un cookie, et une requête média ne lit que
>    l'appareil : un visiteur ayant choisi « sombre » sur un OS clair aurait eu
>    une barre blanche au-dessus d'une page sombre, et la barre n'aurait pas
>    suivi une bascule dans Réglages. Une balise sans `media`, posée par le
>    script bloquant qui résout déjà le cookie avant le premier rendu, et
>    maintenue par `apply()` du `ThemeProvider`. **Mesuré 4 cas sur 4** :
>    `system` + appareil sombre → `#080a0e`, `system` + appareil clair →
>    `#ffffff`, cookie `dark` sur appareil clair → `#080a0e`, cookie `light` →
>    `#ffffff`. Arbitré avec l'utilisateur.
> 2. **La barre passe du vert de marque au fond de page.** L'en-tête est
>    `bg-background` : une bande verte au-dessus lui faisait une couture. Les
>    deux valeurs sont `--background` **mesuré** au pixel dans les deux thèmes
>    (`oklch(1 0 0)` → `#ffffff`, `oklch(0.145 0.01 256)` → `#080a0e`) parce que
>    la balise est servie avant toute feuille de style. `BRAND_COLOR` ne servait
>    qu'à ça et **disparaît**. Un test échoue si le token bouge.
> 3. **Le manifeste prend les mêmes valeurs** (`theme_color` et
>    `background_color` en blanc), sans quoi l'écran de démarrage aurait
>    clignoté en vert avant de rendre une page blanche. Le démarrage est donc
>    blanc avec l'icône verte, ce qui est l'esthétique claire de la planche
>    `Installer`. Contrepartie assumée : un visiteur en thème sombre voit ce
>    démarrage clair, `background_color` ne pouvant pas dépendre du thème.
> 4. **Les icônes gardent la marque intacte sur fond blanc**, contre la tuile
>    verte que dessine la planche. La planche montre une **loupe générique**,
>    pas notre marque : notre repère est vert foncé, et **mesuré à ~1,5:1 sur
>    `#1e7f43`** — il y disparaît. Le rendre lisible sur vert aurait demandé de
>    recolorer le logo, ce qui est un redessin et non une retouche. Arbitré avec
>    l'utilisateur, qui a choisi la marque intacte.
> 5. **La géométrie est mesurée, pas devinée.** `logo.png` fait 1632×2106 et
>    **remplit sa boîte** — aucun rembourrage transparent à retrancher, vérifié
>    au rognage. Le repère prend **78 %** de la hauteur de la tuile pour les
>    icônes ordinaires, **76 %** pour l'`apple-touch-icon` (les coins y sont
>    arrondis).
> 6. **La marge du `maskable` se calcule sur la DIAGONALE** et non sur la
>    hauteur, la zone sûre étant un **cercle** de 80 % du côté, donc
>    `h × √(1 + rapport²) ≤ 0,8 × côté`, ce qui donne un rapport de **0,6309**.
>    **Mesuré sur le fichier** : encre la plus éloignée du centre à **161,5 px**
>    pour un rayon sûr de 204,8 — **zéro pixel dehors**.
> 7. **`icon-512.png` tient déjà dans la zone sûre** (199,5 px contre 204,8), ce
>    qui aurait permis de n'en livrer qu'une. La variante `maskable` est gardée
>    quand même : elle a une marge réelle là où l'autre frôle le bord, et un
>    lanceur qui rogne plus qu'annoncé ne pardonne pas les 5 px d'écart.
> 8. **Trois icônes de raccourci en plus des trois entrées.** La planche les
>    dessine, et Android affiche des carrés vides sans elles. Les tracés sont
>    ceux de la planche elle-même, repris dans son SVG, en `#1e7f43` sur blanc.
> 9. **`apple-mobile-web-app-title` en plus.** iOS avant 17.4 ignore le
>    manifeste et étiquette l'icône avec le `<title>`, qui fait ici 52
>    caractères. Une balise pour un nom d'écran d'accueil juste.
> 10. **`rel="icon"` ne pointe plus sur `logo.png`.** Un portrait 1632×2106 de
>     103 ko servait de favicon ; c'est `icon-192.png` désormais, avec ses
>     `type` et `sizes`. `logo.png` reste en place, il porte encore l'identité
>     sur les écrans d'authentification et sur `/q/:code`.
> 11. **Les balises de document ne peuvent pas vivre dans un `meta()`.** Le
>     `meta()` d'une route **remplace** celui de la racine, donc la couleur de
>     barre ne survivait que parce que `pageMeta()` la répétait. Elle est
>     maintenant écrite en dur dans le `<head>` de `Layout`, et `pageMeta()` ne
>     l'émet plus — un test le garde, deux balises mettant la première en
>     vigueur et figeant la couleur.
> 12. **`og:image` reste RELATIF, et c'est une dette**, pas une régression :
>     elle l'était déjà. Facebook demande une URL absolue, et le client n'a
>     aucun `APP_URL` — seul `apps/admin` en a un. La rendre absolue demande
>     soit une variable d'environnement de plus, soit de faire passer l'origine
>     du `request` par les quinze `meta()` qui appellent `pageMeta()`.
> 13. **L'image de partage est rendue dans Chromium**, pas par `sharp` : les
>     polices du système ici n'ont que DejaVu et Liberation, alors qu'un rendu
>     navigateur embarque la vraie Geist en `woff2`. Vérifié que la police est
>     bien celle-là (`document.fonts.check`), et la ligne d'accroche
>     **rééquilibrée** après mesure — elle laissait « fatalité » seule sur sa
>     ligne.
> 14. **Le générateur d'actifs n'est pas versionné.** `sharp` n'est pas une
>     dépendance déclarée de `apps/client` (il n'est là que par transitivité),
>     donc un script committé aurait cassé dès la première installation propre.
>     Toute la géométrie est consignée ci-dessus pour être refaite à
>     l'identique.
> 15. **`format:check` ne couvre pas `.webmanifest`** — le script ne liste que
>     `ts, tsx, js, jsx, json, md, css`. Le fichier est indenté à la tabulation
>     à la main, comme les `.json` du dépôt, et rien ne le vérifiera.
>     `react-router-serve`, lui, le sert déjà en `application/manifest+json`
>     sans configuration : R24 n'a rien à ajouter de ce côté.
> 16. **Aucun pixel de page ne change.** Le diff ne touche que le `<head>` et
>     une balise `meta` écrite par `apply()` : les deux thèmes ont été relevés
>     (§2.3 règle 8) sur ce qui change réellement, la couleur de barre, et non
>     sur une campagne de contraste que cette étape ne peut pas déplacer.

> **Mesures.** Verdict d'installabilité relevé sur le **build servi** et non sur
> le serveur de développement, ce qui prouve du même coup que les dix actifs de
> `public/` sont bien copiés dans `build/client/` par `react-router build` —
> `files: ["build"]` suffit donc, aucun ajout à l'allowlist. Zéro erreur
> d'installabilité, zéro erreur d'analyse, cinq autotests de sonde justes dans
> la même exécution. Couleur de barre juste dans **4 cas sur 4**. Zone sûre du
> `maskable` : **0 pixel** d'encre hors du cercle, encre la plus lointaine à
> 161,5 px pour 204,8 permis. Typecheck 9/9, lint sans erreur, `format:check`
> propre. Tests **+24 client (880 → 904)**, admin **409/409**, api **379/379**.
> Densité de commentaires **9,3 %** (18,6 % à la première mesure, taillé en deux
> passes : le raisonnement de l'arbitrage était écrit trois fois dans le code
> alors qu'il appartient à ce document).

> **L'instabilité sous charge parallèle a gagné le client.** `pnpm run test` à
> la racine a fait tomber `apps/admin` **et** trois cas de
> `routes/stickers/order/__tests__/order-flow.test.tsx`, ce dernier fichier
> mettant 71 s à lui seul avec des expirations à 15 s. Les trois suites passent
> **seules** — client 904/904, admin 409/409, api 379/379. Ce n'est pas une
> régression de R23, qui ne touche ni `apps/admin` ni le tunnel de commande :
> c'est le symptôme déjà consigné par R22, désormais visible aussi côté client.

> **Les insets latéraux ne sont PAS repris ici.** L'entrée disait « à reprendre
> ici » ; arbitré avec l'utilisateur en faveur de **R34**, qui existe déjà pour
> ça. Mêlée aux actifs PWA, une refonte de gouttière sur seize écrans rend les
> deux moitiés du diff illisibles à la relecture. **Recomptage pour R34** : ce
> ne sont pas huit fichiers qui lisent `env(safe-area-inset-*)` mais **quinze**,
> et deux d'entre eux ne figuraient dans aucune liste —
> `routes/posts/details/components/contact-bar.tsx` (une sixième barre basse) et
> `routes/home/components/stickers-section.tsx` (inset droit).

#### R24 — Service worker, coquille et page hors-ligne

1. Coquille applicative précachée.
2. Annonces en _stale-while-revalidate_, images en _cache-first_.
3. Page `/offline` : ce qui reste lisible, et le brouillon conservé.
4. Stratégie de mise à jour explicite : pas de service worker qui sert
   indéfiniment une version périmée.

**Fichiers** : `apps/client/`, configuration de build. **Flux** : tous.
**Acceptation** : une annonce déjà consultée s'ouvre sans réseau.

> **Acceptation atteinte, mesurée l'origine réellement coupée.** Une annonce
> déjà lue s'ouvre à froid sans réseau, à son URL, avec son contenu. Relevé sur
> le **build servi**, dans un Chromium piloté : **14 verdicts sur 14**, dont
> **sept autotests** qui prouvent que la sonde sait détecter un échec.

> **La stratégie, en toutes lettres.** Un document public part en _network
> first_ — un serveur joignable ne sert donc jamais une page périmée — et sa
> copie répond hors réseau. Un actif de `/assets/` part en _cache first_ :
> **mesuré**, il est servi `max-age=31536000, immutable` derrière un nom haché,
> le seul endroit où une lecture de cache ne peut pas être périmée. Un fichier
> de `public/` est servi `max-age=0` (mesuré), donc _stale-while-revalidate_,
> comme les charges utiles de loader publiques. Les photos, qui viennent d'une
> autre origine, sont en _cache first_ et reviennent opaques. Chaque cache a un
> plafond d'entrées, taillé du plus ancien.
>
> Le point 4 tient sur trois pièces : le script du worker est servi `max-age=0`
> (mesuré) **et** enregistré en `updateViaCache: 'none'` avec un `update()` à
> chaque chargement, donc un worker n'est jamais relu depuis le cache HTTP ; le
> nom d'un cache porte une version de schéma, qu'un **déploiement ne bouge pas**
> — un nom d'actif portant déjà son empreinte, garder les morceaux du build
> précédent est ce qui laisse une page déjà ouverte continuer de les charger
> après que le serveur les a remplacés.

> **Dix-huit écarts consignés.**
>
> 1. **Le brouillon ne part PAS au retour du réseau : le point 3 est faux pour
>    ce dépôt**, pas seulement incomplet. **Mesuré** : R18 ne conserve que les
>    **huit champs texte**, les photos étant volontairement absentes (« un
>    `File` meurt avec la page qui l'a choisi »), et `publishAction` exige une
>    session vivante et poste du multipart. Un envoi automatique publierait donc
>    une annonce **sans photo** que personne n'a confirmée. La page dit ce qui
>    est vrai : « Votre brouillon d'annonce est conservé. Vous pourrez le
>    publier dès le retour du réseau. » Arbitré avec l'utilisateur.
> 2. **La coquille n'est pas précachée depuis une liste de build : elle est
>    amorcée à l'installation.** **Mesuré** : 151 actifs pour 3,0 Mo, et
>    `react-router build` n'émet **aucun** `.vite/manifest.json` où lire la
>    liste. Le worker met en cache `/offline` et `/`, puis lit le HTML des deux
>    pour en extraire leurs URL `/assets/` — une liste dérivée à l'exécution ne
>    peut pas retarder sur le build dont elle est tirée. **Un seul chargement
>    contrôlé suffit** à un démarrage à froid hors réseau. Arbitré avec
>    l'utilisateur contre les deux autres options : rien du tout (deux
>    chargements nécessaires) et la liste complète (~1,9 Mo à l'installation,
>    sur un réseau souvent facturé au volume).
> 3. **Le worker est du TypeScript bundlé par un second `vite build`**, pas un
>    `public/sw.js` écrit à la main : 12 lignes de configuration, 57 ms, un IIFE
>    de 3,0 ko, **aucune dépendance nouvelle**, et
>    `/// <reference lib="webworker" />` passe `tsc --noEmit` et `eslint` aux
>    côtés de `lib.dom`. En échange, sa politique est typée, lintée et couverte
>    par 29 cas là où un fichier de `public/` n'aurait été relu que par lecture
>    de son texte source. Arbitré avec l'utilisateur.
> 4. **Seuls les documents PUBLICS sont mis en cache**, contre la carte « Votre
>    annonce » que dessine la planche. **Mesuré** : aucun loader de `/`,
>    `/posts`, `/posts/:id`, `/about`, `/contact`, `/terms`, `/privacy`,
>    `/stickers` ni `/scan` n'appelle `getServerSession`, alors que
>    `/account/*`, `/notifications`, `/publish/*` et `/q/:code` — qui porte le
>    prénom du propriétaire — en dépendent. Un document authentifié resterait
>    lisible sur l'appareil **après déconnexion**. La liste hors connexion ne
>    montre donc que les annonces publiques consultées. Arbitré avec
>    l'utilisateur.
> 5. **Une page privée hors réseau est quand même rattrapée.** Écrite d'abord en
>    « laisser passer », elle faisait tomber `/account` hors réseau sur l'écran
>    d'erreur du navigateur — **mesuré**. Une stratégie `navigation` distincte
>    répond pour ces pages sans **jamais** les stocker.
> 6. **Le WASM du décodeur est exclu** de la mise en cache comme de l'amorçage.
>    Ce sont 1,1 Mo pour un scan qui a de toute façon besoin du réseau derrière
>    `/scan/status`.
> 7. **La bannière est dans le flux, sous l'en-tête**, et non à la place de
>    l'en-tête comme la planche la dessine. §2.1 nomme la bannière comme la
>    primitive d'une explication et y range déjà « hors-ligne » ;
>    `ModerationBanner` se lit ainsi ; et l'en-tête porte la navigation qui
>    reste utile sans réseau. Sa palette est reprise **telle quelle** de
>    `ModerationBanner` — un encart n'invente pas une paire de couleurs (R21).
> 8. **La barre d'onglets n'est pas atténuée** comme sur la planche. Hors
>    réseau, `/` et une annonce déjà lue s'ouvrent réellement : une navigation
>    grisée annoncerait le contraire de ce que l'étape livre.
> 9. **Une redirection, pas le document hors connexion sous l'URL demandée.**
>    Servi comme corps, le routeur hydraterait une route sous le chemin d'une
>    autre. **Mesuré sur un site jetable** : un navigateur suit bien la
>    redirection qu'un worker rend à une navigation — ce n'était pas acquis, et
>    le repli aurait été un document qui se relocalise en JavaScript.
> 10. **Le second saut de cette redirection cherchait une clé qui n'existe
>     pas.** `/offline?from=…` ne correspond pas à `/offline` : un `cache.match`
>     honore la requête. Symptôme mesuré : `net::ERR_FAILED`. La branche hors
>     connexion lit désormais le **chemin seul**.
> 11. **La page hors connexion a besoin de SON PROPRE morceau de JS.** Amorcer
>     les actifs de `/` seul suffisait à l'afficher mais **pas à l'hydrater** :
>     sa liste, que seul un effet remplit, restait vide, et la bannière ne
>     s'affichait pas non plus. Mesuré, puis corrigé en lisant les actifs des
>     **deux** documents amorcés.
> 12. **`setOffline` de Playwright ne coupe pas les requêtes émises PAR le
>     service worker.** Trois relevés « réussis » étaient faux : le worker
>     servait depuis le réseau, l'acceptation n'était pas prouvée. La sonde tue
>     désormais l'origine — `process.kill(-pid)` sur le groupe, `npx` forkant le
>     vrai serveur — et un autotest exige que le worker lui-même n'atteigne plus
>     rien avant qu'un verdict compte.
> 13. **`/offline` est monté DANS la coquille**, donc il porte l'en-tête, le
>     pied et la barre d'onglets, et la bannière l'accompagne.
> 14. **Le repli hors connexion vaut aussi pour une navigation côté client.** Un
>     loader qui ne joint pas le réseau n'atteint jamais la redirection du
>     worker : l'`ErrorBoundary` de la racine rend la même page quand
>     `navigator.onLine` est faux. Lu **une fois**, à la première image — le
>     régler dans un effet aurait fait clignoter « Une erreur est survenue ».
> 15. **`retryTarget` réutilise `sanitizeRedirect`** plutôt que d'écrire un
>     second garde d'open-redirect, et remappe son repli `/account` — qu'aucun
>     visiteur hors réseau ne peut lire — sur `/`.
> 16. **L'index des annonces consultées vit en `localStorage`**, pas dans le
>     cache : un cache tient des documents, pas des titres, et lire le `<title>`
>     d'un HTML mis en cache aurait été un analyseur de plus. Il est
>     **intersecté** avec le cache à l'affichage, parce que la pastille dit « EN
>     CACHE » : une entrée que la taille a fait tomber offrirait un lien qui
>     ramène sur la page hors connexion.
> 17. **Le titre est `text-2xl` (18) là où la planche dit 21.** R33 ne compte
>     pas 21 parmi ses sept barreaux, et `/scan` comme `/q` — mêmes écrans à une
>     seule fin — portent déjà `text-2xl`.
> 18. **Rien à configurer côté service.** L'entrée annonçait « configuration de
>     build » ; il n'y a eu que le second `vite build`. **Mesuré** :
>     `react-router-serve` sert `build/client/sw.js` en `application/javascript`
>     avec `Cache-Control: public, max-age=0`, donc la fraîcheur du worker est
>     acquise sans en-tête à poser.

> **Mesures.** Verdicts relevés sur le build servi, l'origine tuée après
> amorçage : **14/14**, sept autotests compris (l'un d'eux exigeant que le
> worker lui-même ne joigne plus rien). Démarrage à froid sur `/` sans réseau,
> annonce déjà lue rouverte à son URL, chemin jamais lu redirigé vers
> `/offline?from=…`, chemin privé redirigé de même, aucun document `/account`
> stocké, WASM absent du cache d'actifs. Contraste et gabarits relevés sur les
> deux écrans nouveaux, **sept largeurs × deux thèmes**, 860 lignes lues : trois
> autotests justes (17,28 / 18,98 · 6,39 · 5,03), **zéro couleur refusée**,
> aucune taille hors des sept barreaux, aucun champ sous 16 px, aucune cible
> sous 44 px, aucun défilement horizontal, et pour seul échec de contraste le «
> CI » du logotype à 2,7:1 déjà dispensé. Typecheck 9/9, lint sans erreur,
> `format:check` propre. Tests **+71 client (904 → 975)**. Densité de
> commentaires **9,5 %** (11,3 % à la première mesure : le raisonnement de la
> redirection était écrit deux fois, et la stratégie de mise à jour trois fois,
> alors qu'elle appartient à ce document).

#### R25 — Invite et page d'installation

1. Capter `beforeinstallprompt` et proposer l'installation **dès l'arrivée sur
   la plateforme**, quel que soit le point d'entrée.
2. Remonter la route `/download` en page « Installer l'application », avec le
   parcours iOS documenté (Safari n'émet pas l'événement).
3. Entrée discrète et permanente dans Compte.

**Fichiers** : `routes/download/` (remontée dans `app/routes.ts`),
`app/components/`. **Flux** : tous. **Acceptation** : l'invite s'ouvre sur
n'importe quelle page d'entrée dès que le navigateur remet une offre, jamais sur
`/q/:code`, et jamais après un « Plus tard ».

> **Livrée. Écarts et mesures.**
>
> **Le déclencheur a été retourné en cours d'étape, sur arbitrage.** Le point 1
> disait « après une réussite, jamais au chargement », et la note `note-pwa` du
> canevas dit la même chose. Les deux sont **caduques** : l'invite est désormais
> proposée dès l'arrivée. Le critère d'acceptation a donc été réécrit plutôt que
> laissé à l'envers du produit, et les deux marqueurs de réussite qui avaient
> été câblés — un `?success=published` porté par la redirection de publication,
> un `?success=activated` par « Terminer » du scanner — ont été retirés :
> `publish.action.ts` et `scan/_index.tsx` sont revenus mot pour mot à leur état
> d'avant R25. Une règle, pas deux.
>
> **Un seul écran reste couvert par une exception : `/q/:code`.** Qui arrive là
> vient de scanner le sticker d'un inconnu et cherche à joindre un propriétaire.
> Lui ouvrir une feuille d'installation par-dessus est exactement l'interruption
> que `note-scanav` décrit. La feuille est montée une fois à la racine et écarte
> ce chemin par son `pathname`.
>
> **L'événement précède l'hydratation — et c'est la vraie difficulté de
> l'étape.** Mesuré sur le build servi, tête réelle sous `xvfb` avec profil
> persistant neuf : Chromium émet `beforeinstallprompt` avant que React
> n'hydrate, et un `useEffect` posé par la racine le rate. Le symptôme est muet
> — l'écouteur existe, l'offre n'est jamais arrivée, rien dans la console. La
> parade est celle que R23 a déjà employée pour le thème : un script bloquant
> dans le `<head>`, qui appelle `preventDefault()` et range l'événement sur
> `window`. La racine adopte ensuite ce dépôt et continue d'écouter. Sans cela,
> l'invite ne s'ouvre jamais, quel que soit le déclencheur choisi.
>
> **Trois promesses des planches sont fausses, et sont réécrites.** La première
> est celle d'une alerte reçue app fermée : il n'y a **aucun web push** dans le
> dépôt — ni `PushManager`, ni `VAPID`, ni clé — et A3 reste une question
> ouverte, non planifiée. Ensuite « Moins d'1 Mo » : la coquille amorcée par R24
> pèse **968 Kio** mesurés sur le build servi (deux documents et 65 actifs),
> avant les 1,1 Mo de WASM du premier scan. Enfin « Vos annonces lisibles hors
> connexion » : R24 a tranché que les documents privés ne sont **jamais** mis en
> cache. Les trois cartes disent désormais l'ouverture depuis l'écran d'accueil,
> les annonces **déjà consultées** hors connexion, et l'absence de store — trois
> choses que R23 et R24 livrent réellement.
>
> **« Plus tard » est définitif**, retenu en `localStorage` : proposée à
> l'arrivée, l'invite ne peut pas se permettre de revenir. Un balayage ou une
> touche d'échappement, en revanche, ne ferme que la visite en cours — un geste
> ne doit pas condamner une porte qu'on ne rouvre que depuis Compte. Refuser la
> feuille ne retire pas au passage le bouton de la page d'installation, qui
> reste la porte permanente avec l'entrée dans Compte et le lien du pied de
> page.
>
> **Le bouton « Installer maintenant » n'est pas permanent pour autant.** Il
> n'apparaît que si le navigateur a remis une offre : Safari n'en remet jamais,
> et une app déjà installée a dépensé la sienne. Sans bouton, l'étape 1 ne nomme
> que le menu du navigateur ; en `display-mode: standalone`, la page dit que
> l'installation est faite et retire les étapes. La colonne iPhone s'ouvre
> d'elle-même sur un appareil Apple, après hydratation puisque le serveur n'a
> pas reçu l'agent. La note du bas explique l'absence de bouton plutôt que
> d'affirmer que Safari est obligatoire — Chrome iOS sait aussi ajouter à
> l'écran d'accueil.
>
> **Le script de tête supprime la barre d'installation native de Chromium sur
> toutes les pages**, pour tout le monde. C'est le prix de la maîtrise du moment
> et du libellé ; l'icône d'installation de la barre d'adresse reste, elle, le
> repli du visiteur qui a répondu « Plus tard ».
>
> **La route garde le chemin `/download`** et n'a besoin d'aucun `+types/` :
> elle n'a ni loader ni action. Le pied de page retrouve son lien, sous le
> libellé « Installer l'app ». Les quatre composants de l'ancienne page qui
> vendaient une app native restent sur disque, non référencés et marqués comme
> tels, selon le précédent R18. La tuile de l'accueil reste dans sa section
> commentée.
>
> **Acceptation : 16 verdicts sur 16**, dont deux autotests — que Chromium
> propose bien une installation sur ce build, et que la feuille sait s'ouvrir.
> Sans eux, un verdict « pas de feuille » serait vide de sens. La feuille est
> vue s'ouvrir sur sept points d'entrée, rester fermée sur `/q/:code`, et ne
> jamais revenir après un refus.
>
> **Contraste et gabarit.** Huit autotests sortent aux valeurs de la maison
> (17,28 / 18,98 / 6,39 / 5,03), zéro couleur refusée par le canvas, 70 relevés
> sur 7 largeurs × 2 thèmes. Comme la feuille recouvre désormais chaque page,
> les écrans sont lus une fois l'offre refusée — une feuille Vaul masque la
> sonde (R22) — et une passe la garde ouverte pour la lire elle-même. **Aucun
> constat n'est imputable à ce que R25 dessine** : les seuls échecs de contraste
> sont le « CI » du logotype (2,7:1, dispensé) et le « AK » de l'avatar
> d'en-tête ; toutes les tailles hors barreaux et tous les recouvrements relevés
> appartiennent à l'accueil, sous la feuille. Un relevé comparatif contre
> `refonte` sans R25, pris à l'état antérieur de l'étape, donnait déjà contraste
> 92 = 92, cibles sous 44 px 12 = 12, barreaux 20 = 20, débordement 8 = 8,
> recouvrements 122 → 110.
>
> **Deux dettes préexistantes confirmées au passage.** Le « AK » de l'avatar
> d'en-tête mesure **1,05:1** en 1024 px, et `/account` déborde à 464 px sous
> 430 px — `RecentListings`, dont le lien « Voir tout » fait 71 × 18. Les deux
> se relèvent à l'identique sur la référence.
>
> **Un stub de mesure a révélé que `AuthContext` lit `user.email` sans garde** :
> une session sans email fait tomber toute la coquille sur
> `Une erreur est survenue`. better-auth en pose toujours un, donc ce n'est pas
> un défaut atteignable — mais la ligne mérite d'être connue.
>
> **Tests** : +38 côté client (975 → 1013). Densité de commentaires **7,7 %**.

### Lot 9 — Authentification

> Neuf écrans du canevas (page « Authentification ») : connexion, inscription en
> trois étapes, mot de passe oublié en deux écrans, la feuille « règle du numéro
> », plus la connexion et le code SMS en 1440 px et la variante tablette.
>
> Le lot s'ouvre par **R26**, la seule étape à toucher `packages/contracts` :
> les quatre suivantes redessinent des formulaires dont les schémas lisent le
> prédicat qu'elle pose.

#### R26 — Règle du numéro ivoirien

> **Recompté par R24 : cette étape est DÉJÀ LIVRÉE**, par `#152`
> (`feat(contracts): hold a typed phone number to the ivorian rule`). Vérifié
> fichier par fichier : `isAssignableLocalNumber` et
> `ASSIGNABLE_PHONE_ERROR_MESSAGE` existent dans
> `packages/contracts/src/shared/phone.ts`, les **sept** points de saisie du
> tableau ci-dessous les lisent, et les **trois** points de connexion et de
> récupération sont restés sur `isValidLocalNumber`. Ce qui reste à faire ici
> est de vérifier la couverture demandée par « Tests » et de refermer l'entrée,
> pas de reposer le prédicat.

**Mesuré (§1.1).** `isValidLocalNumber` ne vérifie **que la longueur** : dix
chiffres, aucun préfixe contrôlé nulle part dans le dépôt. Vérifié en exécutant
le validateur réel :

| Saisie       | Aujourd'hui | Stocké           |
| ------------ | ----------- | ---------------- |
| `0612345678` | accepté     | `+2250612345678` |
| `0000000000` | accepté     | `+2250000000000` |
| `1234567890` | accepté     | `+2251234567890` |

Un numéro étranger devient un faux numéro ivoirien, aucun SMS ne part, et
l'utilisateur reste bloqué sur l'écran du code — sans qu'aucun message ne lui
dise pourquoi.

**Règle confirmée** : `+22501`, `+22505` ou `+22507` suivis de huit chiffres,
soit `^0[157]\d{8}$` en forme locale.

**Décision — deux prédicats.** Vérifié dans `better-auth@1.6.30`
(`dist/plugins/phone-number/routes.mjs`, lignes 53 et 145) : le
`phoneNumberValidator` du greffon `phoneNumber()` garde exactement **deux**
routes, `/sign-in/phone-number` et `/phone-number/send-otp`. Il n'existe donc
aucun moyen d'être strict à l'inscription et laxiste à la connexion avec un
prédicat unique : le resserrer verrouillerait dehors tout compte existant dont
le numéro stocké ne s'y conforme pas. C'est l'arbitrage déjà retenu pour le mot
de passe, dont aucune des deux routes de connexion ne borne la valeur reçue.

1. `packages/contracts/src/shared/phone.ts` : ajouter `isAssignableLocalNumber`
   (`^0[157]\d{8}$` appliqué à `toLocalDigits`) et son message,
   `ASSIGNABLE_PHONE_ERROR_MESSAGE` — « Entrez un numéro ivoirien : 01, 05 ou 07
   suivi de 8 chiffres ». `isValidLocalNumber` **ne change pas**.
2. Basculer sur le prédicat strict les sept points où un numéro est **saisi** ;
   laisser les trois autres sur la longueur seule.
3. Vérifier que `toE164` reste inchangé : il n'a jamais été le problème.

**Les dix points d'appel**, recomptés (l'audit en annonçait treize ; il comptait
les deux barils de ré-export `apps/{client,admin}/app/shared/utils/phone.ts` et
les fichiers de test) :

| Fichier                                                      | Rôle du numéro                    | Prédicat                                     |
| ------------------------------------------------------------ | --------------------------------- | -------------------------------------------- |
| `apps/api/src/infrastructures/auth/auth.config.ts:21`        | connexion **et** envoi d'OTP      | longueur, inchangé                           |
| `apps/client/…/routes/auth/login/login.schema.ts:9`          | connexion                         | longueur, inchangé                           |
| `apps/client/…/auth/password-forgotten/…schema.ts:8`         | récupération d'un compte existant | longueur, inchangé                           |
| `apps/client/…/routes/auth/register/register.schema.ts:13`   | création de compte                | **strict**                                   |
| `apps/client/…/account/settings/settings.schema.ts:31`       | changement de numéro              | **strict**                                   |
| `apps/client/…/routes/publish/publish.schema.ts:59`          | contact WhatsApp d'une annonce    | **strict**                                   |
| `apps/client/…/routes/stickers/order/order.schema.ts:13`     | téléphone du destinataire         | **strict**                                   |
| `packages/contracts/src/qr-codes/contact-owner.schema.ts:10` | numéro de qui a trouvé            | **strict**                                   |
| `packages/contracts/src/lost-items/create.schema.ts:26`      | contact WhatsApp, côté API        | **strict**                                   |
| `apps/admin/…/administrators/administrators.schema.ts:29`    | téléphone administrateur          | **strict**, branche `value === ''` conservée |

> Les deux dernières lignes de `packages/contracts` sont les jumelles serveur de
> `publish.schema.ts` et du formulaire QR : les resserrer côté front seul
> laisserait l'API accepter ce que le front refuse.

**Fichiers** : `packages/contracts/src/shared/phone.ts`, les sept schémas
ci-dessus, et les deux barils de ré-export si le nouveau nom doit y transiter.
**Flux** : E, et A, B, C par les champs de contact. **Acceptation** : `06…`,
`00…` et `12…` sont refusés à la saisie avec un message qui nomme les préfixes ;
un compte existant portant un numéro non conforme se connecte toujours.
**Tests** : projet `node` sur
`packages/contracts/src/shared/__tests__/phone.spec.ts` — accepter `01`, `05`,
`07` suivis de huit chiffres ; refuser `02`, `04`, `06`, `08`, `09`, `00`, un
neuf-chiffres et un onze-chiffres ; et **un test qui assure
qu'`isValidLocalNumber` reste laxiste**, sans quoi la connexion se resserrerait
par accident au premier refactor.

#### R27 — Connexion et inscription

**Objectif** : rendre l'inscription franchissable quand le SMS n'arrive pas.

1. **Le drapeau.** `phone-step.tsx` affiche `/logo.png` — le logo de
   l'application — comme drapeau à côté de `+225`. Le remplacer par un drapeau
   ivoirien en SVG inline (trois bandes, aucun fichier à ajouter dans
   `public/`), ou ne garder que `+225`.
2. **La durée de vie du code.** `OTP_EXPIRY_SECONDS = 120` est écrit **en dur,
   deux fois** (`register/components/otp-step-section.tsx:11`,
   `reset-password/components/otp-step-section.tsx:14`), là où le serveur
   accorde `OTP_TTL_SECONDS = 300` (`apps/api/src/shared/auth/otp.const.ts`).
   Conséquence mesurée : à deux minutes le compte à rebours tombe à zéro, le
   bouton « Confirmer » se désactive (`timeLeft === 0` dans `otp-step.tsx:89`),
   et **un code encore valide trois minutes devient inutilisable**. Remonter
   `OTP_TTL_SECONDS` dans `@app/contracts/shared/otp.ts`, à côté d'`OTP_LENGTH`
   qui y est déjà pour exactement la même raison, et le lire des deux côtés.
3. **Le renvoi anticipé.** « Renvoyer le code » n'apparaît qu'une fois le compte
   à rebours à zéro. Le proposer après **30 s**. Le compte à rebours dit
   l'expiration du code, pas la disponibilité du renvoi : deux informations
   distinctes, deux affichages.
4. **La correction du numéro.** Le bouton « Retour » existe déjà (`goBack` dans
   `register/_index.tsx:42` et `reset-password/_index.tsx:37`) — **mais il perd
   le numéro** : `PhoneStepSection` est démonté puis remonté avec
   `defaultValues: { phoneNumber: '' }`, et il faut le resaisir en entier.
   Remonter `phoneNumber` dans l'état de la page et le passer en valeur par
   défaut. Ajouter en plus, sous les cases du code, un lien « Modifier le numéro
   » : le « Retour » en tête de page ne se lit pas comme une correction.
5. **Deux constantes qui traînent.** `otp-step.tsx:89` teste `otp.length < 6` en
   dur, quand le `maxLength` du même composant lit déjà `OTP_LENGTH`. Et le
   champ et le bouton sont en `h-12` (48 px), sous les 52 px de §2.1 : adopter
   la taille que R2 pose sur `Button` et `Input` plutôt qu'une classe locale.

   > **Écart constaté (§1.1), moitié reportée.** Le `otp.length < 6` est
   > corrigé. La hauteur ne l'est pas : **R2 n'a pas encore été livrée** — au
   > moment de R27, `refonte` ne porte que R1 (#150) et R26 (#152), et
   > `packages/ui` n'expose ni taille `touch` sur `Button` ni variante haute
   > d'`Input`. Il n'y a donc pas de « taille que R2 pose » à adopter, et la
   > poser ici ferait de R27 (scope `client/auth`) une PR `ui`. Les `h-12`
   > restent : 48 px passent déjà le plancher de 44 px de R2, sous les 52 px de
   > §2.1. **Repris par R28**, finalement, et non par R2 : l'habillage sur la
   > maquette y impose les 52 px sur ces trois fichiers. R2 garde les 31 autres
   > points d'appel et la pose de la taille dans `packages/ui`.

6. **Le compte créé sans mot de passe** _(constaté en session, hors plan
   d'origine)_. Vérifier le code **connecte** le visiteur — c'est ce qui
   autorise `set-initial-password` — et `register/_index.tsx` porte le garde
   `isAuthenticated → navigate(redirectTo)` destiné à renvoyer un visiteur déjà
   connecté. Il se déclenchait donc sur la session que l'étape 2/3 venait de
   créer : le visiteur atterrissait sur `/account` **sans avoir jamais défini de
   mot de passe**, et sans pouvoir en définir un, puisque le changement de mot
   de passe demande l'actuel. Deux moitiés, une par couche : le garde client ne
   s'applique plus qu'à l'étape `phone`, et la route exporte
   `shouldRevalidate = () => false` — son loader ne porte aucune donnée, et sa
   revalidation après chaque `fetcher.submit` rejouait `redirectIfAuthenticated`
   au milieu du tunnel.

**Fichiers** : `routes/auth/components/{phone-step,otp-step,ivorian-flag}.tsx`,
`routes/auth/hooks/use-otp-countdown.ts`, `routes/auth/register/_index.tsx`,
`register/components/{phone-step-section,otp-step-section}.tsx`,
`reset-password/{_index.tsx,components/otp-step-section.tsx}`,
`routes/auth/login/components/login-form.tsx`,
`packages/contracts/src/shared/otp.ts`, `apps/api/src/shared/auth/otp.const.ts`.
**Flux** : E. **Acceptation** : qui n'a rien reçu peut redemander un code au
bout de 30 s et corriger son numéro sans le resaisir ; aucun code encore valide
côté serveur n'est refusé par le front ; l'étape 3/3 tient jusqu'à ce que le mot
de passe soit posé. **Tests** : projet `ui` sur le passage d'étape, la
conservation du numéro au retour et le maintien sur 3/3 une fois connecté
(`register/__tests__/register-flow.test.tsx`), plus le double compte à rebours
(`hooks/__tests__/use-otp-countdown.test.tsx`) ; projet `node` sur la constante
partagée (le test d'`apps/api` qui affirmait `OTP_TTL_SECONDS === 300` a
déménagé avec elle dans `packages/contracts/src/shared/__tests__/otp.spec.ts`).

#### R28 — Mot de passe oublié, et l'habillage du lot auth

**Mesuré.** Le parcours comptait **trois** écrans : `/auth/password-forgotten`
(numéro) puis `/auth/reset-password?phone=…` avec deux étapes internes, code
puis nouveau mot de passe. Le code n'était vérifié qu'à la soumission du mot de
passe : `NewPasswordStepSection` échouait, appelait `onFail()`,
`reset-password/_index.tsx:80` renvoyait à l'étape du code — dont le compte à
rebours repartait à zéro au remontage — et **le mot de passe saisi était
perdu**.

1. Une seule requête `/phone-number/reset-password`, ce qui était déjà le cas.
2. Un code refusé s'affiche sur les cases et **n'efface plus le mot de passe
   saisi**.
3. Le numéro reste affiché et modifiable, et revient prérempli sur l'écran
   précédent.
4. Le `redirectTo` traverse désormais tout le parcours de récupération
   (`helpers/recovery-url.ts`), qui le perdait entièrement : le lien « Mot de
   passe oublié ? » de la connexion, les deux écrans, et le retour à la
   connexion après succès.

> **Écart assumé (§1.1) — deux écrans, pas un.** Le plan d'origine et la
> maquette (`AuthRecuperation`, note de planche : « Le second écran fusionne
> code et nouveau mot de passe […] Un seul envoi, une seule validation »)
> demandaient **un** écran. Arbitrage de séance : **deux** écrans, code puis mot
> de passe, le mot de passe n'étant demandé qu'après la saisie du code. La
> propriété que la fusion visait est tenue autrement — un seul `useForm` reste
> **monté** derrière les deux étapes (`div` masqué, jamais démonté), donc un
> code refusé ramène à l'étape du code sans rien effacer.
>
> **Contrainte d'API à connaître** : better-auth 1.6.18 ne sait pas valider un
> code de reset seul. Il est rangé sous l'identifiant
> `${phoneNumber}-request-password-reset` et n'est consommé que par
> `/phone-number/reset-password`, qui exige le code **et** le mot de passe dans
> le même appel. `set-initial-password` ne sert qu'un compte sans mot de passe
> et ne peut donc pas servir de second temps. Une vraie vérification au bout de
> l'étape 1 demanderait une étape API (§ Étapes API).

**Bug corrigé, hors plan d'origine — une réussite lue comme un refus.** Signalé
en séance : « la vérification de l'OTP échoue toujours la 1ère fois ; en
resaisissant le même code, tout marche ». **Deux défauts distincts**, le second
n'ayant été trouvé qu'en reproduisant le parcours dans le navigateur contre
l'API réelle — la lecture du code seule menait à la mauvaise conclusion.

1. **La soumission conclue avant d'être partie.** La garde
   `if (!hasSubmitted || fetcher.state !== 'idle') return`, avec `hasSubmitted`
   levé à côté de `fetcher.submit()`, est fausse deux fois : `submit()` ne fait
   pas sortir le fetcher de `idle` dans le lot de rendu qui l'appelle, donc
   l'effet s'exécute sur un rendu où rien n'a été demandé et sa branche `else`
   annonce un refus que l'API n'a jamais envoyé ; et se raccrocher au rendu
   `submitting` ne marche pas non plus, ce rendu n'étant **pas garanti** (mesuré
   : le fetcher passe de `idle` à `idle` avec la réponse déjà là).
2. **`isOk` veut dire « réussi **et** au repos ».** Or le fetcher n'est
   justement pas encore au repos quand sa réponse arrive. Consulter `isOk` dans
   la branche revenait donc à traiter **toute réinitialisation réussie** comme
   un code refusé. Mesuré de bout en bout : l'API répond `{"status":true}`, la
   ligne de vérification est bien consommée, et l'écran affiche « Code incorrect
   ou expiré ».

Le seul signal honnête est **la réponse elle-même** : React Router en rend un
objet neuf par soumission réglée, et cet objet porte son propre `success`. D'où
`useActionFetcher` qui expose `response` (ajout purement additif dans
`@app/web-kit`) et `routes/auth/hooks/use-settled-submission.ts`, qui passe la
réponse réglée à son appelant plutôt que de laisser relire le fetcher. Couvert
par `hooks/__tests__/use-settled-submission.test.tsx`, un cas par défaut.

> **Méthode, pour la prochaine fois.** Le premier correctif a été livré sur la
> foi de la lecture du code et d'un test à double de l'action ; il ne traitait
> que la moitié du problème. Ce qui a tranché : poser une ligne de vérification
> à la main en base (aucun SMS envoyé, Letexto étant configuré), rejouer
> `/phone-number/reset-password` en curl — succès du premier coup, donc serveur
> hors de cause — puis piloter l'écran réel avec Playwright et lire à la fois le
> POST, la réponse et l'écran final. Pour un défaut de ce genre, reproduire
> d'abord.

> **Même défaut encore ouvert ailleurs** : `account/stickers/components/`
> `activate-sticker-dialog.tsx` et `account/posts/components/listing-card.tsx`
> portent la même garde à deux branches. Non traités ici (hors scope
> `client/auth`) — à reprendre, `useSettledSubmission` étant déjà écrit.

**Habillage sur la maquette, absorbé dans cette étape** (arbitrage de séance : «
tout dans R28 »). Les cinq écrans du lot auth sont alignés sur les planches
`AuthConnexion`, `AuthNumero`, `AuthCode`, `AuthMotDePasse` et
`AuthRecuperation` du canevas :

- `components/auth-page-header.tsx` — la barre de 56 px (retour, nom du
  parcours, « 2 / 3 ») plus la jauge à segments et le titre. Elle remplace le
  lien « Retour » et le `h2` que chaque page portait en propre.
- `components/password-checklist.tsx` — la règle de mot de passe en trois lignes
  qui se cochent, à la place de `PASSWORD_HINT`. Elle lit les mêmes constantes
  que `passwordSchema`.
- `components/phone-rule-card.tsx` — « Numéros ivoiriens uniquement ». Posée
  **seulement** sur l'inscription : la connexion et la récupération lisent un
  compte existant et ne doivent pas annoncer une règle qu'elles n'appliquent
  délibérément pas (§2.2, flux E, invariant 1).
- `components/auth-note.tsx` — la carte grise d'attente (« Le SMS met parfois
  une minute à arriver. Le code reste valable 5 minutes », la TTL venant de
  `OTP_TTL_SECONDS`, pas d'un chiffre en dur).
- `components/auth-submit-button.tsx` — le bouton unique, sorti de `otp-step` et
  de `password-step` : deux blocs sur un écran, une seule soumission.
- **L'étape code n'a plus de bouton** : la maquette n'en met aucun, les six
  chiffres _sont_ la soumission (`onComplete`). La valeur est passée
  directement, la relire sur le formulaire courrait après le changement qui
  vient de la produire.

> **Trois conséquences à consigner.**
>
> 1. **La pastille d'expiration disparaît.** R27 l'avait posée ; la maquette la
>    remplace par la carte d'attente et le compte à rebours du renvoi («
>    Possible dans 24 s »). `useOtpCountdown` expose toujours `timeLeft` et
>    `formatTime`, désormais sans appelant — son test reste vert. L'invariant de
>    R27 (« aucun code encore valide côté serveur n'est refusé par le front »)
>    est tenu plus fortement : il n'y a plus de porte à fermer.
> 2. **Les 52 px de §2.1 sont adoptés ici** (`h-13`, rayon 14 px) sur les
>    champs, les boutons et les cases du code. C'était le travail de **R2**, que
>    R27 avait dû reporter faute de taille `touch` dans `packages/ui` : les
>    `h-12` de `phone-step.tsx`, `otp-step.tsx` et `login-form.tsx` ne sont donc
>    **plus** à reprendre. Les 31 autres points d'appel du reste de l'app le
>    restent, et R2 doit toujours poser la taille dans `packages/ui` — après
>    quoi ces classes locales deviendront la variante partagée.
> 3. **Une partie de R30 est consommée.** Les chaînes déplacées ou réécrites ici
>    sont accentuées correctement : les quatre de `password-step.tsx`, «
>    Verification… » et « Code incorrect. Vérifiez et réessayez. » de
>    `otp-step.tsx`. Les **sept** de `branding-panel.tsx` et ses trois chiffres
>    inventés sont partis avec R29 : R30 s'est donc close sans travail propre.

**Non fait, et pourquoi** : le champ « Votre prénom » de `AuthMotDePasse` («
Affiché à la personne qui trouve votre objet »). Il n'existe ni dans
`@app/contracts/auth` ni en base, et `set-initial-password` ne porte que
`newPassword` : c'est une étape API (contrat + migration + use-case), pas un
habillage. Voir § Étapes API.

**Fichiers** :
`routes/auth/components/{auth-page-header,auth-note, auth-submit-button,password-checklist,phone-rule-card,otp-step,otp-slots, password-step,password-input,phone-step}.tsx`,
`routes/auth/helpers/recovery-url.ts`,
`routes/auth/hooks/use-settled-submission.ts`,
`routes/auth/{login,register,password-forgotten,reset-password}/`,
`packages/web-kit/src/action/use-action-fetcher.ts`. **Flux** : E.
**Acceptation** : un code faux ne coûte plus la saisie du mot de passe ; aucune
soumission n'est conclue avant que l'API ait répondu ; les cinq écrans suivent
la maquette. **Tests** : projet `ui` sur les deux parcours
(`reset-password/__tests__/reset-password-flow.test.tsx`, 6 cas ;
`register/__tests__/register-flow.test.tsx`, 11 cas) et sur le hook de
soumission (4 cas) ; projet `node` sur `recoveryUrl` (6 cas).

#### R29 — Layout auth aux trois largeurs

**Mesuré.** `branding-panel.tsx:6` était `hidden … lg:flex` et la colonne de
formulaire `max-w-md`, soit 448 px. Entre 768 et 1023 px — une tablette en
portrait fait exactement 768 px — le panneau disparaissait et laissait 448 px de
formulaire au milieu d'une page vide, surmontés d'une barre à un seul logo.

1. **Un composant, trois largeurs**, comme le dit la planche `AuthTablette` : «
   C'est le même contenu à chaque fois — pas trois écrans à maintenir. » Sous
   `md` le panneau ne s'affiche pas (la barre de la page porte l'identité) ; de
   `md` à `lg` il se couche en bandeau au-dessus du formulaire ; à partir de
   `lg` il se redresse en colonne.
2. **Une seule barre de tête.** Sous `lg`, la barre pleine largeur de la
   maquette mobile ; à partir de `lg`, la ligne en ligne de `AuthDesktopCode` —
   bouton retour contouré, « Étape 2 sur 3 », jauge courte — car une barre en
   travers de la colonne couperait la composition à deux colonnes en deux.
3. **Une seule hauteur**, en `min-h-dvh` : `100vh` compte la barre d'URL du
   navigateur mobile, qui n'y est pas.

**Vérifié au rendu**, ce qu'aucun test ne couvre : capture des trois écrans
(connexion, inscription, mot de passe oublié) à 390, 768, 1024 et 1440 px, avec
contrôle qu'aucune page ne déborde horizontalement et que le bandeau est présent
dès 768. C'est le critère d'acceptation de cette étape et il reste **hors CI**.

> **Quatre écarts consignés.**
>
> 1. **La réconciliation des deux barres va dans l'autre sens** que ne le
>    suggérait la note laissée par R28 (« la barre du layout accueille le
>    contenu que la page lui passe »). C'est l'inverse : le layout perd sa barre
>    à logo, et `auth-page-header.tsx` reste la seule, portée par la page. Faire
>    remonter le titre, l'étape et le retour jusqu'au layout aurait demandé un
>    `handle` ou un contexte pour un résultat identique, contre la règle qui
>    veut les layouts minces.
> 2. **`root.tsx` garde son `min-h-screen`.** Le point 4 d'origine demandait de
>    n'en garder qu'un sur les **trois** occurrences, `root.tsx:112` comprise —
>    mais ce `body` sert toutes les autres pages, et le point 5 range lui-même
>    `root.tsx` sous **R23**. Seules les deux d'`auth/layout.tsx` sont réduites
>    à une.
> 3. **La copie du panneau passe à la maquette**, correctement accentuée : les
>    trois arguments deviennent « Alertes instantanées », « Stickers QR » et «
>    Votre numéro reste privé » — `AuthDesktop` a remplacé « Couverture
>    nationale » et « 100 % sécurisé ». Réécrire la moitié du bloc en gardant
>    l'autre moitié sans accents aurait été pire. **R30 n'a donc plus d'accents
>    à corriger** : il ne lui reste que les chiffres.
> 4. **Les trois chiffres inventés ne sont pas repris** (« 2,500+ objets », «
>    15,000+ utilisateurs », « 50+ villes »). Ils ne sont pas remplacés non plus
>    : la planche les badge « CHIFFRES RÉELS », et R30 tranche entre les
>    brancher et laisser la bande absente. Un commentaire marque l'emplacement.
>    Écrire à nouveau à la main trois affirmations fausses sur l'écran qui
>    demande la confiance n'était pas une option.
>
> 5. **La connexion ne porte pas le logo que montre `AuthConnexion`.** La
>    planche donne à sa barre « retour + marque », là où les quatre autres
>    portent « retour + nom du parcours ». Arbitrage de séance : un seul motif
>    pour les cinq écrans, donc « Connexion » comme les autres. L'identité reste
>    portée par le bandeau, qui est justement ce que R29 rend visible dès 768
>    px.
>
> Accessoirement : le panneau passe de `xl:w-[55%]` à `xl:w-[44%]`, la
> proportion de la planche (640 sur 1440), et la colonne de formulaire de
> `max-w-md` à `lg:max-w-105` (420 px), sa largeur de lecture dans la maquette.

**Fichiers** : `routes/auth/layout.tsx`, `components/branding-panel.tsx`,
`components/auth-page-header.tsx`, `login/_index.tsx`. **Flux** : E.
**Acceptation** : à 768, 1024 et 1440 px, la page porte une identité de marque,
une seule barre de tête et aucune zone vide dominante. **Non couvert en CI** :
le critère est visuel aux trois largeurs, comme celui de R1.

#### R32 — Hero produit de la page Stickers

**Demandé en séance**, hors plan d'origine, sur une référence apportée par le
commanditaire (le hero de Troov) : fond très clair, titre lourd centré, une
seule action, et des objets portant le sticker en périphérie.

1. Le sticker est **dessiné** (`components/sticker-mark.tsx`), en blanc, vert et
   orange d'après les trois variantes réelles : carré arrondi, trois carrés de
   repérage, pastille de localisation, bandeau « Scanner si trouvé ». Son motif
   QR est **délibérément décoratif** — il se lit comme un code sans en être un,
   pour que personne ne pointe une caméra sur une promesse que l'image ne peut
   pas tenir.
2. Les objets qui le portent (`components/tagged-objects.tsx`) sont des
   silhouettes plates, chacune traitée comme **un emplacement** : une photo
   détourée peut en prendre la place sans que la composition bouge.
3. Le fond reprend les **trois couches de l'accueil et des annonces** — sol
   blanc, grille fine, nébuleuse verte et nébuleuse orange. La page se lit comme
   une page RetrouveCI, pas comme un décalque de la référence.
4. La copie est celle de la maquette, au titre près : « **Les** stickers qui
   ramènent vos objets », au pluriel, arbitrage de séance — on vend des packs,
   pas une unité.
5. Le second bouton « Créer un compte » et le code d'activation `RCI-4A7F-2K91`
   sont **conservés de l'ancien hero**. La première réécriture les avait perdus
   sans que ce soit une décision : commander demande un compte, et l'activation
   par code est une étape réelle du parcours. Le code est du texte, pas un
   ornement — il est lu par les lecteurs d'écran.

> **Écart assumé à la maquette.** La planche `Stickers` du canevas dessine un
> hero **sombre** orienté produit — bloc `#12201A`, prix en gros, pastille «
> Payez à la livraison ». La demande de séance va vers le clair et l'aéré.
> Arbitrage : le clair. La planche reste la référence pour le reste de la page
> (packs, étapes, barre d'action basse), qui n'est pas touchée ici.

> **Ce qui manque, et qui n'est pas un défaut de mise en page.**
> `apps/client/public/` ne contient que `logo.png` : **aucune photographie
> produit**. Les silhouettes tiennent la composition mais se lisent comme
> dessinées à côté de la photo studio de la référence. Le trousseau de clés a
> d'ailleurs été retiré — il ne fonctionnait pas en vectoriel plat. Trois photos
> d'objets portant les stickers réels suffiraient à combler l'écart, sans
> retoucher le code.

**Fichiers** :
`routes/stickers/components/{stickers-hero,sticker-mark, tagged-objects}.tsx`.
**Flux** : C. **Acceptation** : la page ouvre sur le produit porté par les
objets qu'il protège, aux trois largeurs, sans photographie et sans chiffre
inventé. **Non couvert en CI** : le critère est visuel.

#### R31 — Routes d'authentification sans préfixe

**Demandé en séance**, hors plan d'origine : les pages d'authentification
servaient sous `/auth/…` dans les deux applications ; elles servent désormais à
la racine — `/login`, `/register`, `/password-forgotten`, `/reset-password` côté
client, `/login`, `/forgot-password`, `/reset-password` côté backoffice.

**Mesuré** : 101 points d'appel, 58 côté client et 43 côté backoffice, zéro côté
API — aucune route de `apps/api` ne porte ce préfixe, `/api/auth` et
`/api/admin-auth` étant les chemins de better-auth et non des pages.

1. **Le layout devient sans chemin.** `route('auth', layout, […])` devient
   `layout(…, […])` : les pages partagent une mise en page, plus un segment
   d'URL. **Le dossier `routes/auth/` ne bouge pas** — c'est là que vivent leurs
   composants partagés, et la convention `app/routes/<zone>/<page>/` reste
   respectée. Seules les URLs changent.
2. **`sanitizeRedirect` perd son préfixe, et c'est le point sensible.** La garde
   anti-boucle était `value === '/auth' || value.startsWith('/auth/')`. Sans
   préfixe il n'y a plus rien à tester : chaque application nomme désormais son
   `AUTH_PATHS`, et `isAuthPath` le compare au chemin nu, requête et barre
   oblique finale retirées. Les deux specs **parcourent `AUTH_PATHS`**
   (`it.each`), de sorte qu'une page ajoutée à `routes.ts` sans l'être à la
   liste fasse tomber le test au lieu de devenir une redirection vers l'écran de
   connexion.
3. **`routes/auth/_index.tsx` disparaît** : il servait `/auth` et n'y
   redirigeait que vers la connexion. Sans préfixe, cette URL n'existe plus.
4. Le lien de réinitialisation envoyé par courriel au backoffice est bâti par
   `appUrl('/reset-password', request)` — il pointait sur
   `/auth/reset-password`.

> **Aucune redirection de compatibilité.** Les anciennes `/auth/*`
> répondent 404. C'est délibéré : les rétablir remettrait des chemins que
> `sanitizeRedirect` ne refuse plus, donc une boucle de connexion possible par
> `redirectTo`, et le pilote d'Abidjan n'a pas démarré. **Une conséquence à
> connaître** : un courriel de réinitialisation déjà parti vers une boîte
> d'administrateur pointe sur `/auth/reset-password` et ne résout plus. Ces
> liens expirent vite ; il suffit d'en redemander un.

**Fichiers** : `apps/{client,admin}/app/routes.ts`,
`apps/{client,admin}/app/shared/helpers/redirect.ts` et leurs specs,
`apps/client/app/components/bottom-tab-bar.tsx`,
`apps/admin/app/routes/auth/forgot-password/servers/forgot-password.service.ts`,
plus les 54 fichiers portant un littéral. **Flux** : E. **Acceptation** : les
nouvelles URLs répondent, les anciennes ne répondent plus, et aucun `redirectTo`
ne ramène sur une page d'authentification. **Vérifié** : `build` des deux
applications — `routes.ts` résout ses modules par chemin et lui seul le contrôle
— puis les six URLs et cinq `redirectTo` hostiles exercés sur l'application qui
tourne.

#### R30 — Copie et chiffres du panneau de marque — **CLOSE, sans travail propre**

**Ses deux critères d'acceptation étaient remplis avant qu'elle ne commence**,
par les étapes qui l'ont précédée. Elle est close telle quelle : inventer du
travail pour justifier une entrée du plan serait pire que de la refermer.

| Critère d'origine                                     | Rempli par                                                                                                        |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Aucun mot français amputé de ses accents              | R28 (six chaînes, `otp-step` et `password-step`) puis R29 (les sept de `branding-panel`, réécrit sur la maquette) |
| Aucun chiffre inventé sur un écran d'authentification | R29, qui n'a pas repris « 2,500+ objets », « 15,000+ utilisateurs » ni « 50+ villes »                             |

> **Correction.** Cette entrée réclamait encore, jusqu'ici, « sept chaînes
> restantes dans `branding-panel.tsx` ». C'était faux depuis R29 : la mise à
> jour faite alors n'avait pas pris sur ce point précis, le retour à la ligne de
> Prettier ayant déplacé la coupure que le remplacement visait. Vérifié cette
> fois par recherche sur l'arborescence, pas par édition à l'aveugle.

**Le troisième point — brancher des compteurs réels — devient une étape API**
(A5), et non une dette du lot 9. Ce qui a été mesuré pour trancher :

- `GET /lost-items` est `@AllowAnonymous()` et rend un `total`, donc « annonces
  publiées » est disponible **sans aucun travail API**. Mais son filtre public
  n'exclut pas les annonces résolues, et l'en exclure changerait `/posts` pour
  tout le monde — une décision produit, pas un habillage.
- « Objets rendus ce mois » demande `resolutionStatus` et une fenêtre de dates,
  qu'aucun contrat public n'expose. `/stats` sert le backoffice.
- **Le pilote d'Abidjan n'a pas démarré.** La règle du lot est « ne rien
  afficher tant qu'il n'y a rien » : branchée aujourd'hui, la bande resterait
  masquée. Construire l'endpoint maintenant serait bâtir pour des chiffres qui
  liront zéro.

`branding-panel.tsx` porte un commentaire à l'emplacement de la bande. Le
formateur `Intl.NumberFormat('fr-FR')` et son test partiront avec A5, quand il y
aura un nombre à formater.

**Acceptation** : vérifiée par recherche — aucun littéral de chiffre et aucun
mot français sans accents dans `routes/auth/`, hors commentaires.

### Étapes API

#### A1 — Motif de masquage d'une annonce

**Vérifié** : `LostItem` ne porte qu'un enum `moderationStatus`, et
`ModerateLostItemUseCase` ne reçoit que le statut. **Il n'existe aucun champ de
raison.** C'est la seule migration du chantier.

1. Colonne `moderationReason String?` + migration.
2. Contrat : le champ dans le schéma de modération et dans la réponse.
3. `ModerateLostItemUseCase` accepte et stocke le motif.
4. Saisie côté backoffice au moment de masquer.
5. Affichage côté client dans la carte (complète R13).

**Fichiers** : `packages/database/prisma/schema.prisma`,
`packages/contracts/lost-items/`, `apps/api/src/domains/lost-items/`,
`apps/admin/app/routes/dashboard/posts/`. **Flux** : D. **Acceptation** :
masquer sans motif reste possible ; la carte n'affiche le bloc que s'il y en a
un.

#### A4 — Prénom au compte, et vérification du code de reset

Deux besoins découverts par R28, tous deux impossibles côté front seul.

1. **Le prénom.** `AuthMotDePasse` demande « Votre prénom » en 3/3 de
   l'inscription, « affiché à la personne qui trouve votre objet ». Le champ
   n'existe ni dans `@app/contracts/auth` ni en base, et
   `/account/set-initial-password` ne porte que `newPassword`. Colonne,
   migration, contrat, use-case, puis le champ dans
   `create-password-step-section.tsx`.
2. **La vérification du code de reset** _(facultatif)_. better-auth ne l'expose
   pas : le code est rangé sous `${phoneNumber}-request-password-reset` et n'est
   consommé que par `/phone-number/reset-password`, avec le mot de passe. Un
   endpoint qui le vérifie **sans le consommer** permettrait de refuser un
   mauvais code au bout de l'étape 1 plutôt qu'au bout de l'étape 2. À ne faire
   que si le contrôle final se révèle gênant à l'usage — R28 tient déjà
   l'essentiel, le mot de passe n'étant jamais perdu.

**Fichiers** : `packages/database/prisma/schema.prisma`,
`packages/contracts/src/auth/`, `apps/api/src/presentations/auth/`,
`apps/client/app/routes/auth/register/`. **Flux** : E.

#### A5 — Compteurs publics du panneau d'authentification _(facultatif)_

Repris de R30, qui s'est close sans eux. La maquette (`AuthDesktop`) ferme le
panneau sur deux compteurs badgés « CHIFFRES RÉELS » : annonces en ligne, objets
rendus ce mois. Aucun n'est servi publiquement aujourd'hui.

1. Endpoint public rendant les deux nombres — le second demande
   `resolutionStatus` et une fenêtre de dates, hors du contrat public actuel.
2. Loader sur `routes/auth/layout.tsx`, **tolérant à la panne** : un compteur
   que l'API ne peut pas servir ne doit pas emporter l'écran de connexion, comme
   la pastille de notifications du backoffice qui lit zéro plutôt que de lever.
3. `Intl.NumberFormat('fr-FR')` — la virgule anglaise des anciens chiffres n'est
   pas le séparateur français. Test projet `node` : zéro → rien, `1234` → « 1
   234 ».
4. **Ne rien afficher tant qu'il n'y a rien** : la bande disparaît entièrement
   plutôt que d'annoncer zéro.

**Deux consommateurs depuis R17**, pas un : la pastille de l'accueil affiche « N
annonces en ligne » depuis le `total` de `GET /lost-items`, et attend ce même
endpoint pour le « objets rendus ce mois » que les planches lui dessinent. Le
faire sert donc les deux écrans d'entrée du produit.

**À ne faire qu'une fois le pilote démarré**, sans quoi on livre une bande qui
reste masquée. **Fichiers** : `packages/contracts/src/`, `apps/api/src/`,
`apps/client/app/routes/auth/{layout.tsx,components/branding-panel.tsx}`,
`apps/client/app/routes/home/servers/home.loader.ts`. **Flux** : A, E.

#### A6 — Source d'une commande de stickers _(facultatif)_

Ouvert par R17, qui a tranché le §8 sans dépendance : la mesure retenue est le
nombre de commandes par semaine, lisible sur `/orders` du backoffice. Elle dit
si le produit se vend, pas **d'où** vient la vente, et l'accueil a désormais
deux points d'entrée vers le tunnel — le bloc en position 2 et la page Stickers.

1. Colonne `source` sur `StickerOrder`, avec une migration et une valeur par
   défaut pour les lignes existantes. Un énuméré fermé, pas du texte libre : ce
   qui vient d'une URL n'est pas une donnée de confiance.
2. `createStickerOrderSchema` l'accepte, le use-case la **stampe** comme il
   stampe déjà `PAYMENT_ON_DELIVERY` et le prix du catalogue.
3. Le tunnel propage le marqueur du bloc d'origine jusqu'à l'envoi.
4. Le backoffice l'affiche dans le dialogue de commande, à côté du mode de
   paiement.

**Ne rien poser avant** : un `?from=accueil` que personne ne stocke est une
donnée que rien n'affiche. **Fichiers** : `packages/database/prisma/`,
`packages/contracts/src/sticker-orders/`,
`apps/api/src/domains/sticker-orders/`, `apps/client/app/routes/stickers/`,
`apps/admin/app/routes/dashboard/orders/`. **Flux** : C.

#### A7 — Champs de document sur une annonce — **LIVRÉE**

Ouverte par R18. En Côte d'Ivoire, les objets perdus les plus fréquents sont des
**pièces** : carte nationale d'identité, permis de conduire, carte bancaire,
carte d'assurance. Le formulaire ne connaissait qu'une catégorie `documents` et
un texte libre, alors que ces pièces portent un nom de titulaire et un numéro
que ni un titre ni une description ne rapprocheront jamais.

Ce qui a été livré :

1. **Un énuméré fermé `documentType`** — `national_id`, `driver_licence`,
   `bank_card`, `insurance_card`, `passport`, `student_card`, `other` — dans
   `@app/contracts/lost-items`, plus la colonne `DocumentType` en base et la
   table de libellés `DOCUMENT_TYPE_LABELS` du backoffice, tapée
   `Record<DocumentType, string>` : un type ajouté est une erreur de
   compilation, pas un libellé manquant.
2. **Quatre colonnes, pas trois** : `documentType`, `documentHolderName`,
   `documentNumber` et `documentIssuer` — l'émetteur est la banque ou l'assureur
   que R35 demande. Aucune date de naissance : un nom **avec** une date de
   naissance sur une page indexable est exactement le jeu complet que le point
   sur la vie privée refuse.
3. **Le nom porte le rapprochement**, avec trois verdicts et non deux
   (`compareHolderNames`). Un sous-ensemble vaut le même titulaire — une carte
   imprime trois prénoms là où celui qui l'a perdue en écrit un. Un nom de
   famille partagé et rien d'autre ne tranche **rien**, étant beaucoup trop
   fréquent ici. Et deux noms qui ne partagent aucun mot **disqualifient** la
   paire.
4. **Le numéro n'est jamais public**, garanti par un type et par une sonde en CI
   (voir les écarts ci-dessous).
5. **Aucun numéro de carte bancaire** : pour `bank_card`, le contrat n'accepte
   que quatre chiffres exactement. Le PAN ferait entrer PCI-DSS dans le dépôt
   pour un service qui n'en a pas besoin.
6. **La comparaison porte sur une forme normalisée.** Le numéro : capitales,
   sans rien d'autre que des lettres et des chiffres, donc
   `5811403-13-0015703713RC` et `581140313 0015703713 RC` sont le même permis.
   Le nom : accents retirés, capitales, **ordre indifférent**, l'apostrophe qui
   ferme (`N'GUESSAN` est un mot) et le trait d'union qui ouvre (`JEAN-BAPTISTE`
   en fait deux), une initiale seule écartée.
7. **Le back-office l'affiche** (`PostDocumentBlock`), et dit sur place que le
   numéro n'atteint aucune page publique.

> **Cinq points du plan étaient faux, intenables ou dangereux comme écrits.**
>
> **1. L'analogie avec R11 était fausse, et il fallait inventer le mécanisme.**
> Le point 4 annonçait un numéro « exclu du schéma de lecture publique, comme
> `resolutionStatus` l'est depuis R11 ». R11 a exclu `resolutionStatus` du
> **schéma de filtre**, c'est-à-dire de l'entrée — le §6 de ce plan le dit
> lui-même. **L'API n'a aucun schéma de réponse** : chaque route rend l'entité
> de domaine entière. Il n'y avait donc rien à imiter.
>
> Retenu : une projection **typée**, `PublicLostItem`, dont `documentNumber` est
> déclaré `never` plutôt que retiré — un `LostItem` complet n'est alors **pas**
> assignable et le compilateur refuse le raccourci. Les specs l'ont prouvé en
> échouant à la compilation avant d'être corrigées.
>
> **2. Il y a QUATRE chemins de lecture publics, pas un.** `GET /lost-items`,
> `GET /lost-items/:id` (`@OptionalAuth`), `GET /lost-items/:id/matches`
> (`@AllowAnonymous`, celui qu'on oublie) et **`POST /lost-items/:id/contact`**,
> anonyme lui aussi, qui rendait l'entité complète. Les quatre passent par
> `toPublicLostItem`, appliqué dans les **use-cases** et non dans le contrôleur,
> la convention voulant qu'un contrôleur délègue et rien de plus. La règle qui
> n'ouvre que le publié, et qui vivait dans le contrôleur, descend du même coup
> dans un `GetPublicLostItemsUseCase` — appliquée **en dernier**, pour qu'un
> filtre portant un autre statut ne puisse pas l'élargir.
>
> **3. « Le nom est obligatoire » aurait cassé la publication en production.**
> Lu comme « requis sur toute annonce `documents` », il faisait répondre 400 au
> client actuel, qui n'envoie aucun de ces champs, avant que R35 n'ait posé le
> formulaire. Retenu : le bloc est facultatif en entier, mais **dès qu'il est
> ouvert** — un type, un numéro ou un émetteur — le nom est requis. Un numéro
> sans personne attachée ne rapproche rien et n'est qu'un fragment d'identité
> conservé sans raison.
>
> **4. Le bloc n'est PAS lié à la catégorie `documents`.** Un portefeuille remis
> avec une CNI dedans est la trouvaille la plus fréquente de toutes, et sa
> catégorie est `wallet` : coupler les deux fermait la porte à l'annonce qui a
> le plus besoin du nom du titulaire. La sélection des candidats faisant déjà un
> `OR` sur la catégorie et la ville, la paire reste trouvable.
>
> **5. Un nom différent DISQUALIFIE.** Le plan ne demandait que d'ajouter du
> poids au nom. Recompté sur les constantes : deux pièces de la même catégorie
> dans la même ville marquent **65** pour un seuil à **50** — et **110** quand
> elles partagent en plus la commune, le jour et un mot de description, ce qui
> est la référence du test. Les cartes de deux inconnus d'Abidjan se notifiaient
> donc mutuellement sans qu'aucun nom n'intervienne. Un désaccord sur le seul
> champ identifiant que les deux côtés ont rempli pèse plus lourd que la ville —
> **sauf si les numéros concordent**, auquel cas c'est le nom qui a été mal
> recopié. Le numéro identique vaut 100 à lui seul : ce n'est pas une paire
> probable, c'est le même document.

> **Deux contraintes découvertes dans le code, pas dans le plan.**
>
> **Zod 4 lève à l'import** sur `.omit()` comme sur `.partial()` appliqués à un
> objet portant un raffinement — et `updateLostItemSchema` est exactement
> `createLostItemSchema.omit(...)`. Un `.check()` posé sur le schéma de création
> aurait cassé l'import de `@app/contracts/lost-items` pour l'API **et** les
> deux fronts. D'où un `lostItemFieldsSchema` sans règle, dont chaque écriture
> dérive ses propres contrôles. `z.toJSONSchema` accepte un objet contrôlé, donc
> `@ApiZodBody` et `/docs` ne bougent pas.
>
> **Le plancher de description a dû être reporté sur les DEUX écritures.** Le
> rendre facultatif pour une pièce (point 5 de R35, tranché dans cette étape
> puisque le contrat est ici) demandait de retirer le `.min()` de la forme. Sans
> le réécrire dans le contrôle de la **modification**, une édition aurait
> raccourci ce qu'une création refuse. Il ne s'applique plus quand l'annonce
> nomme à la fois son type de pièce et son titulaire : les deux disent plus
> qu'un paragraphe.

> **Le point 7 était déjà satisfait, vérifié plutôt qu'inventé.** « Le journal
> ne doit jamais écrire le numéro » : les deux seules lignes de journal des
> domaines `lost-items` et `matching` n'écrivent qu'un identifiant et un compte.
> Aucun changement.

> **Ce qui n'a pas pu être mesuré, et pourquoi.** Docker n'existe pas dans cette
> distro WSL, donc aucun Postgres et aucune mesure HTTP en vrai. La mesure se
> fait donc à la frontière de sérialisation
> (`JSON.stringify(...)).not.toContain(...)` sur les quatre chemins) et par une
> **sonde de source en CI** : `public-lost-item-reads.spec.ts` relit les deux
> contrôleurs, relève chaque gestionnaire portant `@AllowAnonymous()` ou
> `@OptionalAuth()`, et exige que le use-case auquel il délègue déclare la
> projection. Comme R34, la sonde a été **prouvée avant d'être crue** : branchée
> sur le use-case non projeté, elle tombe sur ses deux assertions ; rebranchée,
> elle repasse. La migration, elle, est écrite par Prisma et non à la main
> (`migrate diff` entre les deux datamodels, hors ligne), et son SQL a été
> revérifié identique au diff du schéma après coup.

**Fichiers** : `packages/database/prisma/` (enum + 4 colonnes + migration),
`packages/contracts/src/lost-items/` (`documents.schema.ts` nouveau,
`create`/`update` restructurés), `apps/api/src/domains/lost-items/`
(`PublicLostItem`, `toPublicLostItem`, `GetPublicLostItemsUseCase`),
`apps/api/src/domains/matching/` (`normalize-document.ts`, trois constantes de
score), `apps/admin/app/routes/dashboard/posts/` (`PostDocumentBlock`). **Flux**
: A, B.

**Acceptation, chacune mesurée** : une pièce se publie **sans numéro et sans
description** — vérifié sur le `dist` construit, pas sur la source ; aucun
numéro saisi n'apparaît dans une réponse publique — quatre chemins, projection
typée, sonde en CI ; deux écritures différentes du même nom se rapprochent —
`jean kouassi` et `KOUASSI Jean`, `Aïcha` et `AICHA`, `KOUASSI Jean` inclus dans
`KOUASSI Jean Baptiste`.

**Chiffres** : typecheck 9/9 · lint 0 erreur (1 avertissement préexistant dans
`admin`) · `format:check` propre · `pnpm build` vert. Tests : api **411** (+32),
contracts **328** (dont `lost-items` 61 → 73), admin **413** (+4), client
**1021** inchangé. Densité de commentaires **9,5 %**. Le diff du schéma Prisma
est confiné à l'énuméré et au bloc `LostItem`, dont le réalignement est
inévitable, `documentHolderName` étant plus large que tout nom qu'il portait —
aucun autre modèle n'a été reformaté.

**R35 est débloquée.**

#### A8 — Joindre le propriétaire d'un sticker

Ouvert par R19, qui a buté dessus. La maquette dessine « Prévenir sur WhatsApp »
puis « Appeler » en tête de `/q/:code`, et promet dans le même écran que « le
numéro du propriétaire ne vous est jamais montré ». Les deux ne tiennent pas
ensemble : `wa.me` comme `tel:` affichent le numéro d'un contact inconnu. Il
faut donc trancher **ce que le propriétaire accepte**, pas seulement comment le
front l'affiche.

1. **Le consentement est explicite et se donne à l'activation.** Une colonne sur
   `QrToken` — par défaut **fermée** — dit si un trouveur peut appeler ou écrire
   directement. La feuille d'activation (R22) pose la question en une phrase, et
   `ScanActivation` dit déjà la conséquence au propriétaire. Sans consentement,
   `/q/:code` reste ce que R19 a livré : un message, et rien d'autre.
2. **Le numéro ne descend jamais dans la page.** `/qr-codes/:code/scan` reste ce
   qu'il est — prénom, libellé, objet lié — et gagne au plus un booléen. Le saut
   se fait par un point d'entrée dédié qui répond une redirection, de sorte que
   le HTML servi ne porte pas le numéro et que le saut soit journalisable.
3. **Le débit doit être plafonné avant, pas après.** Le code est énumérable et
   le dépôt n'a **aucune** limitation de débit ; un point d'entrée qui rend
   joignable un numéro sans plafond est un annuaire. C'est la condition
   d'ouverture de ce lot, pas une amélioration ultérieure.
4. **Un numéro absent n'est pas une erreur.** `user.phoneNumber` est nullable :
   l'écran retombe alors sur le formulaire, sans bouton mort.

**Fichiers** : `api/domains/qr-codes/`, `api/presentations/qr-codes/`,
`packages/contracts/qr-codes/`, `packages/database`, puis `client/q` et la
feuille d'activation de R22. **Flux** : B, C. **Acceptation** : un sticker sans
consentement n'expose aucun bouton d'appel ; le numéro n'apparaît dans aucune
réponse HTML.

#### R35 — Publication guidée d'une pièce

Ouvert par R18, dépend d'**A7**, qui est livrée : le contrat, la base et le
rapprochement portent les champs, il reste le formulaire. Côté formulaire, une
pièce se décrit autrement qu'un téléphone : ce qui compte n'est ni la couleur ni
la marque, mais le type de pièce et le nom du titulaire.

1. **Choisir `Documents` ouvre un second choix** — CNI, permis, carte bancaire,
   carte d'assurance, passeport — au lieu d'un champ de description vide.
2. **Les champs suivent le type choisi** : nom du titulaire et numéro pour une
   CNI ou un permis ; banque et quatre derniers chiffres pour une carte bancaire
   ; assureur et numéro de police pour une carte d'assurance. **Seul le nom est
   requis** (A7) : qui a perdu sa pièce ne connaît pas son numéro.
3. **Le numéro est demandé différemment des deux côtés.** Sur `/publish/found`
   la pièce est en main : le champ est en avant et le texte dit de le recopier.
   Sur `/publish/lost` il est replié derrière « Je le connais », pour ne pas
   laisser croire qu'on ne peut pas déclarer sans lui.
4. **Dire pourquoi le numéro est demandé, à l'endroit où il est demandé** : il
   n'apparaîtra sur aucune page, il sert à rapprocher et à vérifier à la remise.
   Un champ qui réclame un numéro d'identité sans se justifier ne sera pas
   rempli — ou le sera par les mauvaises personnes.
5. **La description devient facultative** pour une pièce : le type et le nom la
   remplacent, et `MIN_DESCRIPTION_LENGTH` n'a plus de sens ici.
6. **Pas d'écran de revendication qui compare un numéro** : le contact passe par
   WhatsApp comme pour toute annonce. Un formulaire qui compare un numéro sans
   plafond est un oracle, et un formulaire qui l'exige exclut celui qui a perdu
   sa pièce. La vérification se fait entre les deux personnes, à la remise.

**Fichiers** : `apps/client/app/routes/publish/`,
`apps/client/app/routes/posts/details/`, `apps/client/app/routes/q/`. **Flux** :
A, B. **Acceptation** : publier une CNI perdue n'exige que le type et le nom du
titulaire, et aucun numéro saisi n'apparaît sur la page publique.

#### A2 — Transformations Cloudinary à l'upload _(facultatif)_

Si R4 dérive les URLs côté front, l'upload peut rester tel quel. À faire
seulement pour borner l'original stocké : `eager` avec une largeur maximale dans
`uploadImageBuffer`.

**Fichiers** : `apps/api/src/infrastructures/storage/cloudinary.client.ts`.

#### A3 — Notifications poussées sur correspondance _(facultatif)_

VAPID, table d'abonnements, envoi branché sur le domaine `matching`. Le lot 8 se
livre sans. À décider quand l'installation aura des chiffres — pousser des
notifications à personne n'a pas d'intérêt.

#### R36 — L'arrivée des stickers devient un signal — **LIVRÉE**

Ouverte par le commanditaire en relisant l'accueil : le pavé noir de R22, posé
**au-dessus** du hero et en pleine largeur, se lit comme un interstitiel sur un
écran large, et c'est la première chose qu'un acheteur revenant voit qu'il ait
compris le message ou non.

Ce qui a été livré :

1. **L'arrivée devient une notification**, créée par l'API quand une commande
   franchit `delivered` — **sur la transition seule**, de sorte qu'un
   back-office qui réenregistre une commande déjà livrée ne le dit pas deux
   fois. `UpdateStickerOrderStatusUseCase` injecte `CreateNotificationUseCase`,
   comme `matching` et `qr-codes` le font déjà. Nouveau `NotificationType`
   (`stickers_delivered`) dans le contrat, dans l'énuméré Prisma et dans les
   deux `switch` exhaustifs du mappeur, plus sa migration.
2. **Le compte restant devient un marqueur de coquille** : sur l'onglet Scanner
   sous `lg`, sur « Mes stickers » et sur l'avatar au-dessus.
   `/account/stickers` portait déjà sa propre carte, rien à y ajouter.
3. **Le pavé et son test restent sur disque**, commentés avec leur raison.

> **Une notification est un événement ; ce pavé était une tâche en cours.** La
> proposition initiale était de tout confier aux notifications. Impossible tel
> quel : une notification se lit une fois, alors qu'activer douze stickers prend
> des jours — l'invite aurait disparu au premier « lu », le travail non fait.
> D'où le partage : l'événement à la notification, la tâche au marqueur, qui lui
> ne s'éteint qu'à la douzième activation.

> **Le compte se lit à côté de la coquille, pas dans un loader racine.** Un
> loader de layout se rejoue à chaque navigation et coûterait un aller-retour de
> session à chaque fois, pour les visiteurs anonymes compris. C'est une route
> ressource (`account/stickers/pending`) que la coquille charge une fois par
> chargement complet — la forme de `publish/matches` et de `scan/status` — et le
> `useEffect` ne part même pas si `AuthContext` dit anonyme.

> ⚠️ **Un `fetcher.load` vers une route absente fait tomber TOUT l'arbre** par
> l'ErrorBoundary par défaut de React Router : `No route matches URL`, en 404,
> et plus rien ne s'affiche. Trouvé en mettant l'appel dans `BottomTabBar` et
> `UserMenu` — les dix tests de coquille existants sont tombés d'un coup, parce
> que leurs `createRoutesStub` ne déclaraient pas la route. Deux conséquences :
> la lecture est remontée **dans la coquille**, qui la redescend en prop (les
> deux composants redeviennent présentationnels, et un seul endroit dépend de la
> route) ; et il faut se souvenir qu'une entrée retirée de `routes.ts` ne casse
> pas un badge, elle casse l'application entière.

> **Ce qui n'a pas été ajouté.** Le libellé de la pastille reste `text-xs` :
> §2.1 interdit **explicitement** `text-[10px]` et `text-[11px]`, et le premier
> jet en avait posé un. Le compte dessiné est plafonné à « 9+ » — deux chiffres
> ne tiennent pas sous une icône — mais le nombre exact est dans le
> `aria-label`, donc la couleur n'est jamais seule à porter l'information.

> ⚠️ **Aucune mesure HTTP réelle** : pas de Docker dans cette distro, donc ni
> Postgres ni passage effectif d'une commande à `delivered`. La migration est
> écrite par `prisma migrate diff` hors ligne (un `ALTER TYPE … ADD VALUE`) et
> la notification est mesurée sur le use-case, pas sur le fil.

**Fichiers** : `api/domains/sticker-orders/` (use-case + module),
`api/domains/notifications/mappers/`, `packages/contracts/src/notifications/`,
`packages/database/prisma/` (énuméré + migration), `client/routes/home/` (pavé
et lecture retirés du loader), `client/routes/layout.tsx`,
`client/components/{header,user-menu,bottom-tab-bar}.tsx`,
`client/routes/account/stickers/servers/pending-count.loader.ts` et
`client/shared/hooks/use-pending-stickers.ts` (nouveaux). **Flux** : C.

**Acceptation** : l'accueil n'ouvre plus sur un pavé ; une commande passée à
`delivered` produit une notification et une seule ; le compte restant reste
visible après lecture de cette notification ; un visiteur anonyme ne déclenche
aucun appel.

**Chiffres** : typecheck 9/9 · lint 0 erreur (1 avertissement préexistant dans
`admin`) · `format:check` propre · `pnpm build` vert. Tests : api **418** (+7),
contracts **329** (+1), admin **413** inchangé, client **1031** (759 en `node`,
272 en `ui`) contre 1021 mesuré sur `refonte`. Densité **8,9 %**.

---

## 6. Ce qui ne bouge pas

- **`@app/contracts`** : aucun schéma n'a besoin de changer, sauf A1 (motif de
  masquage), R26 (le prédicat strict du numéro, et la remontée
  d'`OTP_TTL_SECONDS` depuis `apps/api`) et A7, qui y a ajouté les champs de
  pièce et déplacé le plancher de description de la forme vers chaque écriture.
  R36 y a ajouté une valeur d'énuméré, `stickers_delivered`.
- **Les endpoints de l'API** : tout le front se sert de ce qui existe, y compris
  les correspondances (`/lost-items?type&category&ville`). **Deux exceptions
  mesurées** : R11 a dû laisser passer `resolutionStatus` sur
  `/lost-items/mine`, et R13 a dû ouvrir `/lost-items/mine/summary` — les
  compteurs par puce et la bannière de modération sont des agrégats que la liste
  paginée ne peut pas rendre, et la modération n'est pas un axe filtrable côté
  public.
- **Le découpage `servers/*.loader.ts` / `*.action.ts`** : aucun composant
  n'appelle `apiFetch`.
- **Le style Prettier** (tabulations, 80 colonnes) : pas de reformatage
  opportuniste dans une PR de refonte.
- **Le contrat `ActionResult`** et `useActionFetcher`.
- **Les fonctionnalités désactivées** restent commentées avec leur marqueur de
  raison, jamais supprimées.

---

## 7. Vérification avant chaque merge

1. `typecheck`, `lint --force`, `test --force`, `format:check` — et `build` dès
   que `app/routes.ts` est touché.
2. Le flux **entier** de §2.2 déroulé sur un téléphone, pas seulement l'écran
   modifié.
3. Les deux thèmes vérifiés sur les écrans livrés.
4. Scoping d'auth, absence de requête non bornée, conventions existantes.
5. Les invariants de §2.1 et §2.3 relus point par point.

---

## 8. Points à trancher

| Sujet                          | Question                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | À trancher avant |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| ~~Pagination~~                 | **Tranché** : pagination compacte, pour la position partageable dans l'URL — contre la note de décision de la maquette, qui disait chargement continu.                                                                                                                                                                                                                                                                                                                                  | ~~R9~~           |
| Motif de masquage              | A1 avant ou après R13 ? Avant, si la modération masque déjà des annonces en production.                                                                                                                                                                                                                                                                                                                                                                                                 | R13              |
| ~~Bloc stickers de l'accueil~~ | **Tranché** : le nombre de commandes par semaine, relevé sur `/orders` du backoffice avant et après la mise en ligne du bloc. Le dépôt n'a aucune analytique — ni fournisseur tiers, ni couche d'événements — et en ajouter une est une décision produit et juridique, pas une étape d'interface. L'attribution **par bloc** demande une colonne `source` sur `StickerOrder` : elle part en **A6**. Aucun marqueur `?from=` n'a été posé, il n'aurait rien produit que personne ne lit. | ~~R17~~          |
| Web push                       | A3 vaut-elle son coût ? Le lot 8 se livre sans.                                                                                                                                                                                                                                                                                                                                                                                                                                         | R25              |
| Récupération de mot de passe   | La règle stricte s'y applique-t-elle ? Non par défaut, comme la connexion — mais un numéro non conforme ne recevra jamais son SMS.                                                                                                                                                                                                                                                                                                                                                      | R26              |
| ~~Compteurs du panneau auth~~  | **Tranché** : ni l'un ni l'autre pour l'instant. R30 se clôt sans bande, et la question part en **A5**, à traiter une fois le pilote démarré.                                                                                                                                                                                                                                                                                                                                           | ~~R30~~          |

---

## 9. Références

| Document                 | Contenu                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| Audit UX/UI mobile & PWA | 31 constats priorisés P0/P1/P2, mesures de contraste, plan par lots             |
| Canevas de wireframes    | 48 écrans sur 8 pages, une note de décision par groupe                          |
| `CLAUDE.md`              | Normatif sur l'architecture — en cas de désaccord, il l'emporte sur ce document |
| `AGENTS.md`              | Format de commit, de PR et de tests                                             |
| `.claude/skills/`        | `frontend-conventions`, `unit-tests`, `code-quality-review`                     |

Les liens des deux premiers documents sont dans le message de passation de
l'étape en cours.
