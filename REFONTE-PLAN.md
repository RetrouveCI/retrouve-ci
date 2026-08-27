# Plan de refonte — interfaces mobiles, scanner QR et bascule PWA

> Objectif : refondre `apps/client` en partant du téléphone, remonter les
> stickers QR au rang de produit visible, ajouter un scanner intégré, compléter
> le mode sombre, et rendre l'application installable.
>
> Documents de travail : l'**audit** (31 constats priorisés, mesures de
> contraste, plan par lots) et le **canevas de wireframes** (39 écrans sur 7
> pages) — liens en §9.

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
| Action primaire          | Bouton plein vert `--primary-green`, texte blanc, 52 px, rayon 14                           |
| Action secondaire        | Contour 1,5 px `--border`, encre `--foreground`, même hauteur                               |
| Action « objet perdu »   | Aplat `--accent-orange` + **encre foncée** — jamais de blanc (2,70:1)                       |
| Action destructrice      | Contour rouge, jamais un aplat ; toujours derrière une confirmation                         |
| Cible tactile            | 44 px minimum sous `lg`, sans exception                                                     |
| Champ de saisie          | 52 px, police 16 px sur mobile (sous 16 px, iOS zoome au focus)                             |
| Carte                    | Rayon 14, bordure 1 px `--border`, photo 84 px en liste, 108 px en grille                   |
| Pastille d'état          | 22 px, capitales 10 px, `letter-spacing` 0.04em — une seule forme pour tous les états       |
| Puce de filtre           | Capsule 34–38 px ; active = fond `--foreground`, texte `--background`                       |
| **Bannière**             | Une exception qui appelle une action ou une explication (modération, hors-ligne, livraison) |
| **Feuille inférieure**   | Un panneau qui interrompt : filtres, menu `⋯`, activation d'un sticker                      |
| **Barre d'action basse** | Un écran qui a **une** action dominante : détail d'annonce, tunnel de commande, formulaire  |
| Défilement horizontal    | Réservé aux listes secondaires (catégories, annonces récentes) — jamais à une action        |

**Ce qui n'existe plus** : le menu latéral, la bulle flottante permanente, les
boutons-icônes sous 44 px, le texte blanc sur orange, le texte vert de marque
sur fond sombre, `text-[10px]` et `text-[11px]`.

### 2.2 Les quatre flux de bout en bout

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

| Sujet                      | Décision                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| Barre d'onglets mobile     | **Option C** : Accueil · Annonces · (+) · **Scanner** · Compte                                      |
| Point focal                | « Publier » le garde — c'est le moteur de contenu                                                   |
| Onglet Stickers            | **Supprimé.** « Mes stickers » va dans Compte, l'acquisition passe par le bloc produit de l'accueil |
| Icône scanner du header    | Retirée : l'onglet la rend redondante                                                               |
| Menu latéral (`MobileNav`) | Supprimé ; les liens légaux redescendent au pied de page                                            |
| `ActivityHub`              | Fusionné dans l'écran Compte                                                                        |
| Bascule de navigation      | `md` → **`lg`** : la tablette garde les onglets                                                     |
| Scanner sur desktop        | **Aucun.** L'équivalent est la saisie du code, sur la page Stickers                                 |
| Vert de marque en sombre   | `--primary-green-light` (#2A9D54), 5,71:1 — le token existe déjà                                    |
| Orange en texte, en clair  | Nouveau token `--accent-orange-text` (#B35600), 4,94:1                                              |
| Aplat orange               | Encre foncée, jamais du blanc (2,70:1 contre 6,23:1)                                                |
| Thème                      | Troisième valeur `system`, qui devient le **défaut**                                                |

**Écarté, conservé comme trace** : option A (le scanner au centre, « Publier »
déplacé) et option B (capsule à deux actions). À rouvrir si les stickers
deviennent l'axe principal du produit, ou si les deux actions se révèlent
également fréquentes à l'usage.

---

## 4. Découpage en étapes

Une ligne = une branche = une PR = une session.

| #       | Lot      | Étape                                       | Branche                              | Scope commit        | Charge | Dépend de    |
| ------- | -------- | ------------------------------------------- | ------------------------------------ | ------------------- | ------ | ------------ |
| **R1**  | Socle    | Zones sûres de l'appareil                   | `refonte-r1-safe-areas`              | `client`            | 0,2 j  | —            |
| **R2**  | Socle    | Cibles tactiles 44 px sous `lg`             | `refonte-r2-touch-targets`           | `ui`                | 0,5 j  | —            |
| **R3**  | Socle    | Tokens de couleur accessibles               | `refonte-r3-colour-tokens`           | `ui`                | 1 j    | —            |
| **R4**  | Socle    | Photos servies à la taille d'affichage      | `refonte-r4-image-sizes`             | `client`            | 1 j    | —            |
| **R5**  | Coquille | Thème dans Réglages + option `system`       | `refonte-r5-theme-settings`          | `client/account`    | 1 j    | R3           |
| **R6**  | Coquille | Barre d'onglets à 4 entrées + Scanner       | `refonte-r6-tab-bar`                 | `client`            | 1,5 j  | R2, R5       |
| **R7**  | Coquille | En-tête desktop en trois zones              | `refonte-r7-desktop-header`          | `client`            | 1 j    | R2           |
| **R8**  | Annonces | Filtres en feuille inférieure               | `refonte-r8-filters-sheet`           | `client/posts`      | 1 j    | R2           |
| **R9**  | Annonces | Pagination compacte                         | `refonte-r9-pagination`              | `client/posts`      | 0,5 j  | —            |
| **R10** | Annonces | Barre d'action basse sur le détail          | `refonte-r10-detail-action-bar`      | `client/posts`      | 1 j    | R2           |
| **R11** | Compte   | Filtres de Mes annonces pilotés par l'URL   | `refonte-r11-account-url-filters`    | `client/account`    | 1 j    | —            |
| **R12** | Compte   | Retours honnêtes sur les actions d'annonce  | `refonte-r12-account-feedback`       | `client/account`    | 1 j    | —            |
| **R13** | Compte   | Refonte de la carte d'annonce               | `refonte-r13-account-listing-card`   | `client/account`    | 1,5 j  | R2, R11, R12 |
| **R14** | Compte   | Correspondances sur une annonce             | `refonte-r14-account-matches`        | `client/account`    | 1 j    | R13          |
| **R15** | Compte   | Stickers, commandes et réglages             | `refonte-r15-account-screens`        | `client/account`    | 1,5 j  | R2, R5       |
| **R16** | Accueil  | Hero reconstruit sur une grille             | `refonte-r16-home-hero`              | `client/home`       | 1 j    | R3           |
| **R17** | Accueil  | Annonces récentes et bloc stickers          | `refonte-r17-home-listings-stickers` | `client/home`       | 1 j    | R4, R16      |
| **R18** | Publier  | Publication en trois étapes + brouillon     | `refonte-r18-publish-steps`          | `client/publish`    | 1,5 j  | R2           |
| **R19** | Publier  | Refonte de la page de scan publique         | `refonte-r19-qr-landing`             | `client/q`          | 1 j    | R3           |
| **R20** | Scanner  | Écran caméra et amorce de permission        | `refonte-r20-scanner-camera`         | `client/scan`       | 1,5 j  | R6           |
| **R21** | Scanner  | Décodeur WASM et repli photo                | `refonte-r21-scanner-fallbacks`      | `client/scan`       | 1 j    | R20          |
| **R22** | Scanner  | Activation de stickers en série             | `refonte-r22-sticker-activation`     | `client/account`    | 1 j    | R20, R15     |
| **R23** | PWA      | Manifeste, icônes et couleurs de thème      | `refonte-r23-manifest`               | `client/pwa`        | 1 j    | R1           |
| **R24** | PWA      | Service worker, coquille et page hors-ligne | `refonte-r24-service-worker`         | `client/pwa`        | 1,5 j  | R4, R23      |
| **R25** | PWA      | Invite et page d'installation               | `refonte-r25-install`                | `client/pwa`        | 1 j    | R23          |
| **A1**  | API      | Motif de masquage d'une annonce             | `refonte-a1-moderation-reason`       | `api/lost-items`    | 1 j    | —            |
| **A2**  | API      | Transformations Cloudinary à l'upload       | `refonte-a2-cloudinary-eager`        | `api/storage`       | 0,5 j  | —            |
| **A3**  | API      | Notifications poussées sur correspondance   | `refonte-a3-web-push`                | `api/notifications` | 3 j    | R23          |

**Total ≈ 30 j** en séquentiel, dont ≈ 4,5 j côté API. R2/R3 et R11/R12 se
parallélisent ; les lots 3 à 6 s'ouvrent ensemble une fois la coquille posée.

### Chemin critique

```
R1 → R23 → R24
R2 ↘
R3 → R5 → R6 → R20 → R21
     ↘         ↘ R22
R4 ────────→ R17
R2 → R8, R10, R18
R11 + R12 → R13 → R14
```

**R6 est la seule étape à portée globale** : elle supprime `MobileNav`, déplace
`ActivityHub` et change la bascule `md` → `lg`. Toutes les autres sont locales à
une route ou à un paquet.

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

**Fichiers** : `apps/client/app/root.tsx`,
`apps/client/app/components/bottom-tab-bar.tsx`. **Flux** : tous.
**Acceptation** : sur iPhone à encoche, la barre d'onglets ne passe plus sous la
barre gestuelle ; aucun décalage introduit sur un appareil sans encoche.

#### R2 — Cibles tactiles 44 px sous `lg`

**Objectif** : corriger la taille au niveau du paquet, pas dans 31 fichiers.

1. `packages/ui` : ajouter une taille `touch` (44 px) aux variantes `cva` de
   `Button`, et une variante haute d'`Input` (`h-11`).
2. Appliquer par défaut sous `lg`, garder les tailles actuelles au-dessus.
3. Recompter les points d'appel (31 occurrences relevées : `h-9 w-9`, `size-9`,
   `size-8`) et convertir ceux qui restent au-dessous du seuil.

**Fichiers** : `packages/ui/src/components/ui/button.tsx`, `input.tsx`. **Flux**
: tous. **Acceptation** : aucun élément interactif sous 44 px sous `lg`.
**Tests** : projet `ui`, un test par variante.

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
`routes/posts/details/components/post-gallery.tsx`. **Flux** : A, D.
**Acceptation** : plus aucune URL Cloudinary brute dans un `<img>`. **Tests** :
projet `node` sur le helper, URL Cloudinary et non-Cloudinary.

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

**Fichiers** : `app/shared/helpers/theme.server.ts`, `app/context/theme.tsx`,
`app/routes/account/settings/`. **Flux** : tous. **Acceptation** : un appareil
réglé en sombre ouvre l'app en sombre à la première visite, sans flash blanc.
**Tests** : projet `node` sur `getThemeFromRequest` (cookie absent, `system`,
valeur inconnue).

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
recherche est atteignable depuis n'importe quelle page.

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

#### R9 — Pagination compacte

1. Remplacer le bouton-par-page de `ListingsContent`
   (`Array.from({ length: totalPages })`) par « 1 … 7 8 9 … 40 », ou par un
   chargement continu — voir §8.
2. Vérifier l'absence de débordement horizontal à 360 px.

**Fichiers** : `routes/posts/components/listings-content.tsx`. **Flux** : A.
**Acceptation** : aucun débordement quel que soit le nombre de pages.

#### R10 — Barre d'action basse sur le détail

1. `ContactCard` devient une barre collée en bas : « Contacter par WhatsApp »
   dominante, partage en secondaire.
2. Galerie plein cadre en tête, avec indicateurs de position.
3. Conserver l'encadré de sécurité (« ne versez jamais d'argent… ») dans le
   flux, sous la description.

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

### Lot 7 — Scanner QR

#### R20 — Écran caméra et amorce de permission

1. Route `/scan` et écran plein cadre : viseur, torche, fermeture.
2. **Amorce avant toute demande système** : un écran qui explique l'usage, puis
   `getUserMedia` au tap. Un refus est durable.
3. Décodage par `BarcodeDetector` quand il existe.
4. Analyseur unique acceptant l'URL complète (`https://…/q/RCI-XXXX-XXXX`) et le
   code nu ; normalisation de la casse et des tirets ; refus explicite d'un QR
   étranger.
5. Un sticker activé qui n'est pas le vôtre ouvre `/q/:code` — pas une variante.

**Fichiers** : nouveaux `routes/scan/`, `app/routes.ts`. **Flux** : B, C.
**Acceptation** : aucune demande de permission au chargement d'une page.
**Tests** : projet `node` sur l'analyseur (URL, code nu, casse, QR étranger).

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

### Lot 8 — PWA

#### R23 — Manifeste, icônes et couleurs de thème

1. `manifest.webmanifest` : `display: standalone`, `start_url: /`, `lang: fr`,
   `theme_color`, et `shortcuts` vers Scanner, Publier et Rechercher.
2. Icônes 192 et 512, une variante `maskable` avec marge de sécurité, un
   `apple-touch-icon` 180 — `public/` ne contient aujourd'hui que `logo.png`.
3. Deux `theme-color` avec `media="(prefers-color-scheme: …)"`, déclarées une
   fois dans `root.tsx` plutôt que répétées dans chaque `pageMeta()`.
4. Remplacer `OG_IMAGE` par une image 1200×630 — le partage WhatsApp d'une
   annonce est une boucle centrale du produit.

**Fichiers** : `apps/client/public/`, `app/root.tsx`,
`app/shared/helpers/page-meta.ts`. **Flux** : tous. **Acceptation** : l'app est
déclarée installable par le navigateur.

#### R24 — Service worker, coquille et page hors-ligne

1. Coquille applicative précachée.
2. Annonces en _stale-while-revalidate_, images en _cache-first_.
3. Page `/offline` : ce qui reste lisible, et le brouillon conservé.
4. Stratégie de mise à jour explicite : pas de service worker qui sert
   indéfiniment une version périmée.

**Fichiers** : `apps/client/`, configuration de build. **Flux** : tous.
**Acceptation** : une annonce déjà consultée s'ouvre sans réseau.

#### R25 — Invite et page d'installation

1. Capter `beforeinstallprompt` et proposer l'installation **après une
   réussite** (annonce publiée, sticker activé) — jamais au chargement.
2. Remonter la route `/download` en page « Installer l'application », avec le
   parcours iOS documenté (Safari n'émet pas l'événement).
3. Entrée discrète et permanente dans Compte.

**Fichiers** : `routes/download/` (remontée dans `app/routes.ts`),
`app/components/`. **Flux** : tous. **Acceptation** : l'invite n'apparaît jamais
avant une action réussie.

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

#### A2 — Transformations Cloudinary à l'upload _(facultatif)_

Si R4 dérive les URLs côté front, l'upload peut rester tel quel. À faire
seulement pour borner l'original stocké : `eager` avec une largeur maximale dans
`uploadImageBuffer`.

**Fichiers** : `apps/api/src/infrastructures/storage/cloudinary.client.ts`.

#### A3 — Notifications poussées sur correspondance _(facultatif)_

VAPID, table d'abonnements, envoi branché sur le domaine `matching`. Le lot 8 se
livre sans. À décider quand l'installation aura des chiffres — pousser des
notifications à personne n'a pas d'intérêt.

---

## 6. Ce qui ne bouge pas

- **`@app/contracts`** : aucun schéma n'a besoin de changer, sauf A1.
- **Les endpoints de l'API** : tout le front se sert de ce qui existe, y compris
  les correspondances (`/lost-items?type&category&ville`).
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

| Sujet                      | Question                                                                                         | À trancher avant |
| -------------------------- | ------------------------------------------------------------------------------------------------ | ---------------- |
| Pagination                 | Chargement continu ou pagination compacte ? Le second garde une position partageable dans l'URL. | R9               |
| Motif de masquage          | A1 avant ou après R13 ? Avant, si la modération masque déjà des annonces en production.          | R13              |
| Bloc stickers de l'accueil | Quelle mesure décide qu'il convertit ? À instrumenter dès R17.                                   | R17              |
| Web push                   | A3 vaut-elle son coût ? Le lot 8 se livre sans.                                                  | R25              |

---

## 9. Références

| Document                 | Contenu                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| Audit UX/UI mobile & PWA | 31 constats priorisés P0/P1/P2, mesures de contraste, plan par lots             |
| Canevas de wireframes    | 39 écrans sur 7 pages, une note de décision par groupe                          |
| `CLAUDE.md`              | Normatif sur l'architecture — en cas de désaccord, il l'emporte sur ce document |
| `AGENTS.md`              | Format de commit, de PR et de tests                                             |
| `.claude/skills/`        | `frontend-conventions`, `unit-tests`, `code-quality-review`                     |

Les liens des deux premiers documents sont dans le message de passation de
l'étape en cours.
