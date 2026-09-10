# Plan d'évolution — retours de production et nouvelles fonctionnalités

> Ce plan couvre le premier lot de retours après la mise en production, et les
> fonctionnalités décidées avec lui le **2026-09-10**. Il suit la même méthode
> que `MIGRATION-PLAN.md` (retiré) et `REFONTE-PLAN.md` (devenu un record) : une
> étape, une branche, une PR, une session.
>
> Les étapes portent le préfixe **`F`**. Les préfixes `A`, `E`, `M`, `N`, `P`,
> `R` et `S` sont déjà pris par les chantiers précédents — ne pas les
> réutiliser.

## 0. État des lieux — mesuré le 2026-09-10

Ce qui suit a été compté dans le dépôt, pas supposé.

- **Catégories.** `clothing` et `jewelry` sont **deux** valeurs distinctes,
  présentes dans `LOST_ITEM_CATEGORIES`, dans l'enum Prisma `LostItemCategory`,
  dans les deux sens du mapper `lost-item.mapper.ts`, et dans **trois** tables
  de libellés (`publish.const.ts`, `posts.const.ts` côté client,
  `posts.const.ts` côté admin) plus `dashboard.loader.ts` de l'admin.
- **Aucune bibliothèque d'animation n'est installée** — ni `motion`, ni `gsap`,
  ni `framer-motion`. Aucune dépendance LLM non plus.
- **`LostItem.userId` est obligatoire** (`String`, non nul) avec
  `onDelete: Cascade` vers `User`. Une annonce a donc forcément un propriétaire,
  et supprimer ce propriétaire supprime ses annonces.
- **`CreateLostItemUseCase` lève `listing_pending` à chaque création** et
  l'annonce naît `PENDING` ; la publication est le seul moment où le
  rapprochement tourne.
- **Le module `Event` est une erreur de conception** : il devait être un
  **journal d'audit** (qui a fait quoi, quand) et a été construit comme un
  agenda d'événements communautaires. Il pèse 24 fichiers API, 11 fichiers
  admin, une entrée de contrat et un modèle Prisma — et `apps/client` ne
  l'affiche **nulle part**, alors que `GET /events` est anonyme.
- **L'admin a déjà eu six phases de refonte** (coquille unifiée, barre latérale
  sectionnée, image de marque verte/orange, thème clair-sombre, tableau de bord
  KPI, tons de statut sûrs en sombre). L'app fait **151 fichiers / 10 430
  lignes**. `cmdk` est installé et **inutilisé**.
- **Les fiches de détail sont incohérentes** : `users` a une route dédiée,
  tandis que `posts`, `orders`, `qr` et `contact-messages` passent par des
  dialogues.
- **Le moteur de rapprochement existe et est testé** :
  `domains/matching/helpers/compute-match-score.ts` pèse déjà catégorie, ville,
  commune, écart de date, chevauchement de texte, nom du porteur et numéro de
  pièce, avec un seuil à 50.

## 1. Méthode de travail (contraignante)

Identique à celle des deux chantiers précédents. Elle n'est pas rappelée par
politesse : c'est elle qui a permis de livrer la refonte sans casser la prod.

- **Une étape, une branche, une PR, une session.** Branche
  `evolution/f<n>-<sujet>`, avec une **barre oblique** — mesuré en ouvrant F1 :
  `guard-git.sh` bloque toute commande de push contenant `-f`, et il la cherche
  n'importe où après `git push`, donc une branche nommée `evolution-f1-…` est
  refusée comme si c'était un `--force`. Les chantiers précédents ne l'ont
  jamais rencontré parce que ni `migration-e<n>` ni `refonte-r<n>` ne portent la
  lettre. La PR suit le gabarit What / Why / How / Testing de `AGENTS.md` —
  jamais `gh pr create --fill`.
- **Demander avant chaque commit**, et commiter par pathspec
  (`git commit -- <chemins>`), jamais l'index entier : l'arbre bouge en
  parallèle.
- **Messages de commit et de PR en anglais**, conversation en français,
  interface en français, identifiants de code en anglais.
- **Relire la §2 avant chaque PR.** Les invariants y sont, et une PR qui en
  casse un est refusée même si elle est verte.
- **Relancer toute la chaîne après la dernière retouche** :
  `pnpm format:check && pnpm typecheck && pnpm lint && pnpm test`. `pnpm build`
  ne type-checke pas, et le cache Turbo masque les échecs (`--force` quand un
  compte importe).
- **Lancer chaque suite seule quand un compte importe** : le projet `ui` est
  instable sous charge parallèle.

### 1.1 Mesurer avant d'appliquer

Ce plan décrit une intention. Le dépôt décrit le réel. Avant d'appliquer une
étape, **compter les vrais sites d'appel** et consigner l'écart ici même. Trois
mesures déjà payées ailleurs et qui valent pour ce chantier :

- une garde vérifie une **propriété**, pas une orthographe, et sa liste
  d'exemptions est vide au premier jet ;
- lire le code ne prouve pas l'atteignabilité d'une dépendance — l'instrumenter
  le prouve ;
- `not.toBeInTheDocument()` **passe sur plusieurs correspondances** : compter
  avec `.elements().length`.

### 1.2 Ce qui n'est pas négociable

- **Aucune régression de confidentialité.** `toPublicLostItem` nomme ce qu'une
  lecture publique porte plutôt que de soustraire ce qu'elle ne doit pas porter,
  parce que l'API n'a **aucun schéma de réponse** : une colonne ajoutée est
  publique d'office. Toute colonne ajoutée par ce plan passe par cette
  projection, et la sonde de projection est mise à jour avec elle.
- **Aucune écriture non plafonnée.** `write-routes.spec.ts` découvre chaque
  `@Post`/`@Patch`/`@Put`/`@Delete` de `presentations/` et exige qu'elle tombe
  dans exactement une classe. Une route ajoutée par ce plan y tombe, ou la garde
  passe au rouge — c'est voulu.
- **Aucune notification qui met l'écriture en péril.** Les producteurs passent
  par `notifyDesk` / `notifyUser`, qui avalent l'échec ; `notify-matches` est la
  **seule** exemption et le reste.
- **Le budget réseau du client est un budget mobile.** L'app vise la Côte
  d'Ivoire sur téléphone. Toute dépendance ajoutée à `apps/client` est pesée en
  kilooctets livrés au premier rendu, et le chiffre est écrit dans la PR.

## 2. Invariants à respecter à chaque PR

Ces règles-là sont propres à ce chantier. Les invariants d'interface du client
restent ceux de `REFONTE-PLAN.md` §2, qui reste la référence.

1. **Une annonce a toujours un propriétaire.** `LostItem.userId` reste non nul.
   Le canal équipe passe par un **compte système**, pas par un `userId`
   nullable.
2. **Le compte système ne se supprime pas.** `onDelete: Cascade` effacerait
   toutes les annonces de l'équipe. Le seeder le recrée s'il manque, et
   l'interface d'administration des comptes refuse de le supprimer.
3. **Une annonce de l'équipe est une annonce ordinaire.** Même modèle, même
   formulaire, mêmes champs, même carte. Ce qui la distingue est un badge et le
   contact affiché — rien d'autre.
4. **Une annonce publiée par l'admin ne passe pas par la file de modération.**
   Elle naît `PUBLISHED`, ne lève **pas** `listing_pending`, et déclenche le
   rapprochement immédiatement — la publication est le seul moment où il tourne.
5. **Un commentaire est borné par ce que l'appelant possède.** Le posteur lit et
   écrit sur le fil de **ses** annonces uniquement ; le bureau lit tous les
   fils. La clause `where` de cette portée vit à **un seul endroit**, comme
   `whereFor(scope)` pour les notifications.
6. **Un type de notification ajouté force une décision.** La partition
   `ADMIN_NOTIFICATION_TYPES` / `USER_NOTIFICATION_TYPES` est asserée : un type
   ajouté sans côté fait rougir le spec plutôt que d'atteindre la mauvaise
   cloche par omission.
7. **L'assistant ne lit jamais une ligne brute.** Il ne voit que ce que
   `toPublicLostItem` émet. `documentNumber` et `moderationReasonNote` ne
   quittent pas l'API.
8. **L'assistant ne classe pas.** Il traduit une phrase en filtres ;
   `computeMatchScore` cherche et ordonne. Le modèle ne voit pas les annonces,
   donc il ne peut pas en inventer une.
9. **Toute animation respecte `prefers-reduced-motion`.** Et une animation
   d'entrée ne déplace jamais le contenu déjà peint — pas de décalage de mise en
   page au chargement.
10. **Le CSS d'abord.** Une micro-interaction que Tailwind sait faire ne
    justifie pas un import de bibliothèque d'animation.

## 3. Décisions déjà prises

Arrêtées avec le porteur du produit le **2026-09-10**. Elles ne sont pas
rouvertes sans raison neuve.

### 3.1 Catégories retirées

« Vêtement » et « Bijoux » disparaissent. Les annonces déjà publiées dans ces
deux catégories sont **migrées vers `OTHER`**, puis les deux valeurs sont
retirées de l'enum Prisma et du contrat. La catégorie d'origine est perdue,
c'est assumé.

### 3.2 Le canal équipe

L'équipe RetrouveCI publie **des annonces perdu/trouvé ordinaires**, pour le
compte de quelqu'un : un objet déposé au bureau, une personne qui appelle sans
smartphone. Ce n'est **pas** un canal éditorial — pas de communiqué, pas de
bandeau, pas de modèle distinct.

Le propriétaire est un **compte système « RetrouveCI »**, seedé comme l'est déjà
le super administrateur, et une colonne `official` sur `LostItem` porte le
badge. Deux raisons de ne pas mettre l'admin propriétaire : l'annonce survivrait
au départ de cet admin (le `Cascade` l'effacerait sinon), et elle n'apparaît
dans le « Mes annonces » de personne.

### 3.3 L'assistant de recherche

Version 1 : **le modèle traduit, notre moteur cherche.** Le visiteur écrit une
phrase, le modèle en extrait des filtres (`type`, `category`, `ville`,
`commune`, fenêtre de dates), et `computeMatchScore` — déjà écrit, déjà testé —
cherche et ordonne. Le modèle ne reçoit **aucune annonce**.

L'agent conversationnel qui lit le corpus n'est pas écarté, il est **repoussé**
: il coûte par conversation et il expose les descriptions au modèle. On y
reviendra quand la v1 aura montré ce que les gens tapent réellement.

### 3.4 La refonte admin

Trois manques nommés, dans cet ordre d'importance :

1. **Identité visuelle** — le style paraît daté malgré les six phases.
2. **Densité des listes** — trop peu de lignes visibles, filtres et tri
   éparpillés, pas de barre d'outils cohérente ni de densité réglable.
3. **Navigation et recherche** — trop de clics pour atteindre une entité, pas de
   palette ⌘K ni d'accès direct par code ou par nom.

Les **fiches de détail** restent au programme (c'était une demande explicite),
mais ce n'est pas la douleur principale. Direction retenue : **route dédiée**
pour `posts`, `orders`, `qr` et `users`, dialogue réservé aux **actions**
(masquer, révoquer, changer un rôle). Une route donne une URL qu'un modérateur
peut envoyer à un collègue, un bouton retour, et la place qu'un dialogue n'a pas
pour cinq photos.

Un **artefact de validation** est produit avant d'écrire la moindre ligne de
refonte. C'est l'étape F7, et c'est le pilote de son lot.

### 3.5 Le module Événements

Il est **retiré**, pas réparé. Le journal d'audit qu'il aurait dû être fait
l'objet d'un chantier à part, plus tard, avec sa propre politique de rétention.
Retirer le module maintenant évite de refondre une page qui n'a pas de raison
d'exister, et allège la barre latérale que F10 va restructurer.

### 3.6 Bibliothèque d'animation

**`motion` (motion.dev), pas GSAP.** Déclaratif, s'accorde avec le rendu
concurrent de React 19, et `LazyMotion` permet de ne charger qu'un noyau
d'environ 3 ko au premier rendu. GSAP gagne sur les chronologies pilotées par le
défilement, ce dont ce produit n'a pas besoin. À revoir si une étape prouve le
contraire — et alors avec une mesure, pas un avis.

## 4. Découpage en étapes

### Lot 1 — Retours immédiats

| Étape  | Sujet                              | Portée                                  |
| ------ | ---------------------------------- | --------------------------------------- |
| **F1** | Retirer « Vêtement » et « Bijoux » | contracts, database, api, client, admin |

### Lot 2 — Le canal équipe

| Étape  | Sujet                                               | Portée                       |
| ------ | --------------------------------------------------- | ---------------------------- |
| **F2** | Compte système + publication admin publiée d'office | database, api, admin, client |

### Lot 3 — La conversation sur une annonce

| Étape  | Sujet                                 | Portée                   |
| ------ | ------------------------------------- | ------------------------ |
| **F3** | Modèle, domaine et notifications      | database, contracts, api |
| **F4** | Rédiger et suivre côté administration | admin                    |
| **F5** | Lire et répondre côté client          | client                   |

### Lot 4 — Nettoyage

| Étape  | Sujet                        | Portée                          |
| ------ | ---------------------------- | ------------------------------- |
| **F6** | Retrait du module Événements | database, contracts, api, admin |

### Lot 5 — Refonte de l'administration

| Étape   | Sujet                                | Portée    |
| ------- | ------------------------------------ | --------- |
| **F7**  | Artefact de validation _(pilote)_    | —         |
| **F8**  | Identité visuelle                    | admin, ui |
| **F9**  | Densité des listes et barre d'outils | admin     |
| **F10** | Navigation, recherche et palette ⌘K  | admin     |
| **F11** | Fiches de détail en routes dédiées   | admin     |

### Lot 6 — Animations

| Étape   | Sujet                        | Portée     |
| ------- | ---------------------------- | ---------- |
| **F12** | Socle d'animation _(pilote)_ | client, ui |
| **F13** | Accueil et listes            | client     |
| **F14** | Parcours et retours d'action | client     |

### Lot 7 — Assistant de recherche

| Étape   | Sujet                                   | Portée         |
| ------- | --------------------------------------- | -------------- |
| **F15** | Passerelle d'extraction et plafonds     | api, contracts |
| **F16** | Recherche par phrase, sans conversation | client         |
| **F17** | La conversation, et son repli           | client, api    |

### Chemin critique

`F1` et `F2` sont indépendants de tout et peuvent partir en parallèle. `F3`
précède `F4` et `F5`, qui sont indépendants l'un de l'autre. `F6` précède le lot
5, pour ne pas refondre une page destinée à disparaître. `F7` précède `F8`,
`F9`, `F10` et `F11`. `F12` précède `F13` et `F14`. `F15` précède `F16`, qui
précède `F17`.

Le lot 7 gagne à venir en dernier : il coûte de l'argent par requête, et il vaut
mieux le brancher sur une base stable.

### Pilote

Deux étapes servent de pilote et fixent le vocabulaire de leur lot : **F7** pour
la refonte admin, **F12** pour les animations. Ce qu'elles décident lie les
étapes suivantes de leur lot.

## 5. Détail des étapes

Les étapes des lots 1 à 4 sont détaillées ci-dessous. **Les lots 5 à 7 sont
volontairement esquissés** : leur détail s'écrit juste avant d'ouvrir leur
première étape, quand la mesure aura été faite. Écrire aujourd'hui le détail de
F17 serait inventer.

---

### Lot 1 — Retours immédiats

#### F1 — Retirer « Vêtement » et « Bijoux »

**Objectif.** Les deux catégories disparaissent du produit, et les annonces
existantes restent lisibles.

**Ordre des opérations, et il compte.** La migration de données passe **avant**
le retrait de l'enum : PostgreSQL refuse de retirer une valeur d'enum encore
référencée par une ligne.

1. Migration Prisma en deux temps :
   `UPDATE lost_item SET category = 'OTHER' WHERE category IN ('CLOTHING', 'JEWELRY')`,
   puis retrait des deux valeurs de l'enum. Compter les lignes touchées
   **avant** et le consigner dans la PR.
2. Retirer `'clothing'` et `'jewelry'` de `LOST_ITEM_CATEGORIES`.
3. Suivre les erreurs de compilation : les deux `Record` du mapper sont
   exhaustifs, les trois tables de libellés aussi. C'est le compilateur qui
   guide, pas une recherche textuelle.
4. `dashboard.loader.ts` de l'admin porte une quatrième table, avec un test qui
   surveille précisément la dérive — le lire avant de le modifier.
5. `seo-keywords.ts` mentionne « bijoux perdus » et « bijoux trouvés ». Ce sont
   des requêtes que les gens tapent réellement : les **garder**, un mot-clé
   n'est pas une catégorie.

**Piège.** Sans la migration, une ligne restée en `CLOTHING` remonterait comme
`'clothing'` jusqu'à une table de libellés qui ne la connaît plus — carte sans
catégorie côté client, et l'API n'a aucun schéma de réponse pour l'attraper.

**Recette.** Une annonce anciennement « Vêtement » s'affiche en « Autre » sur la
liste, sur le détail et dans l'administration. Le filtre par catégorie n'offre
plus les deux valeurs. La chaîne complète est verte.

---

### Lot 2 — Le canal équipe

#### F2 — Compte système et publication administrateur

**Objectif.** Un administrateur publie une annonce depuis l'administration ;
elle apparaît dans `/posts` immédiatement, badgée « Équipe RetrouveCI ».

**Base de données.**

- Colonne `official Boolean @default(false)` sur `LostItem`.
- Compte système seedé par `SeederService`, à côté de `seedSuperAdmin` et
  `seedMockUser` : `seedSystemAccount`. Son identité (nom affiché, numéro
  WhatsApp de l'équipe) vient de l'environnement, avec la même règle que le
  super admin — **requis en production**, repli explicite en développement.

**API.**

- La colonne `official` est ajoutée **explicitement** à `toPublicLostItem` et à
  la sonde de projection : c'est une information publique voulue, pas un effet
  de bord.
- Une route d'écriture réservée aux administrateurs. Elle réutilise
  `createLostItemSchema` — même formulaire, mêmes règles — sans `stickerCode`
  (un sticker se résout contre les jetons du posteur, ce qui n'a pas de sens
  ici).
- Elle **ne passe pas** par `CreateLostItemUseCase` tel quel : celui-ci lève
  `listing_pending` et laisse l'annonce en `PENDING`. Deux voies possibles, à
  trancher à l'implémentation et à consigner ici :
  - un `CreateOfficialLostItemUseCase` distinct, qui écrit `PUBLISHED` +
    `official: true` et déclenche le rapprochement ;
  - ou un drapeau d'entrée sur l'existant. **Préférer le use-case distinct** :
    un drapeau qui change à la fois le statut, la notification et le
    déclenchement du rapprochement est trois décisions cachées dans un booléen.
- La route tombe dans la classe « admin-only » de `write-routes.spec.ts`.

**Administration.** Un formulaire de publication, calqué sur celui du client. Le
contact est pré-rempli avec celui de l'équipe et reste modifiable — l'équipe
publie parfois pour quelqu'un qui veut être joint directement.

**Client.** Un badge « Équipe RetrouveCI » sur la carte et sur le détail. Rien
d'autre : c'est une annonce ordinaire, et la §2.3 dit qu'elle le reste.

**Garde.** Le compte système ne doit pas être supprimable depuis
`/administrators` ni `/users`. Le vérifier côté serveur, pas seulement en
masquant un bouton.

**Recette.** Une annonce publiée depuis l'administration est visible sans
modération, badgée, comptée dans les compteurs publics, et déclenche un
rapprochement. Elle n'apparaît dans le « Mes annonces » d'aucun compte humain.
Le bureau ne reçoit pas de notification « annonce en attente ».

---

### Lot 3 — La conversation sur une annonce

#### F3 — Modèle, domaine et notifications

**Objectif.** Un administrateur laisse un commentaire sur une annonce ; le
posteur le lit et peut répondre. Le but est la suggestion — « ajoutez une photo
du dos », « précisez la commune » — pas la modération, qui garde ses motifs.

**Base de données.** Un modèle `ListingComment` : `id`, `lostItemId`,
`authorId`, `authorSide` (`ADMIN` | `OWNER`), `body`, `createdAt`, `readAt`.
`authorSide` est stocké plutôt que déduit : un administrateur est aussi un
utilisateur ordinaire ici, comparer les identifiants ne suffirait pas.

**Contrat.** Un dossier `listing-comments/` : la règle de longueur du corps, et
les deux types de notification.

**Notifications.** Deux types nouveaux — un vers le posteur quand le bureau
écrit, un vers le bureau quand le posteur répond. Les ajouter à
`NOTIFICATION_TYPES` fait rougir le spec de partition tant qu'ils ne sont pas
rangés d'un côté ; c'est le comportement voulu. Les deux producteurs passent par
`notifyDesk` / `notifyUser`, qui avalent l'échec.

**Portée.** Une seule fonction construit la clause `where` du fil, comme
`whereFor(scope)` le fait pour les notifications. Le posteur ne voit que ses
annonces ; le bureau voit tout.

**Plafonds.** L'écriture du posteur est une écriture authentifiée, plafonnée par
`AccountBudget` avec sa propre limite — une conversation n'est pas une
publication, la limite lui est propre. L'écriture de l'administrateur tombe dans
la classe admin.

**Question ouverte, à trancher dans la PR.** Un commentaire recoupe
partiellement `moderationReasonNote`, qui dit déjà au posteur pourquoi son
annonce est masquée. Décider si le motif « autre » de la modération devient un
commentaire, ou si les deux canaux coexistent. Par défaut : **ils coexistent**,
la modération est une décision et le commentaire une suggestion.

#### F4 — Rédiger et suivre côté administration

Le fil sur la fiche d'une annonce. Un indicateur sur la liste pour les annonces
qui ont une réponse non lue. Cette étape croise F11 (la fiche devient une route)
: si F11 est déjà passée, le fil s'y installe ; sinon il vit dans le dialogue et
déménage avec lui.

#### F5 — Lire et répondre côté client

Le fil sur `/account/posts/:id`, et un indicateur sur la carte dans « Mes
annonces ». Le formulaire de réponse suit la convention du dépôt :
`servers/*.action.ts`, `ActionResult`, `useActionFetcher`, react-hook-form avec
`standardSchemaResolver`.

---

### Lot 4 — Nettoyage

#### F6 — Retrait du module Événements

**Objectif.** Retirer un module que personne n'utilise et qui ne fait pas ce
pour quoi il avait été demandé.

**Portée.** Le modèle Prisma `Event` et son enum, le dossier de contrat
`events/`, le domaine et la présentation côté API, la page et sa route côté
admin, l'entrée de barre latérale.

**Avant de supprimer.** La table `event` a été **mesurée vide en production le
2026-09-10**, donc il n'y a rien à exporter et la suppression ne perd aucune
donnée. Recompter au moment d'écrire la migration : la mesure a une date, et le
module reste administrable d'ici là.

**Note.** La consigne du dépôt est « commenter plutôt que supprimer » pour une
fonctionnalité qu'on désactive. Ici ce n'est pas une désactivation mais un
retrait décidé, et ~35 fichiers commentés seraient du bruit. Le code reste dans
l'historique git, et cette section dit où le chercher.

**Suite.** Le journal d'audit n'est pas dans ce plan. Quand il viendra, il aura
sa propre étape et sa propre politique de rétention.

---

### Lot 5 — Refonte de l'administration _(à détailler avant ouverture)_

#### F7 — Artefact de validation _(pilote)_

Un canevas multi-plans présentant la direction retenue, à valider avant toute
ligne de code : tableau de bord, une liste dense avec sa barre d'outils, une
fiche de détail en route dédiée, la palette ⌘K, en clair et en sombre.

Ce que l'artefact doit trancher : l'échelle typographique, la densité de
tableau, la place des filtres, la grammaire des actions (ce qui reste un
dialogue et ce qui devient une page), et le degré de vert dans la coquille — les
teintes oklch actuelles n'ont jamais été vérifiées visuellement dans une app qui
tourne.

#### F8 — Identité visuelle

#### F9 — Densité des listes et barre d'outils partagée

#### F10 — Navigation, recherche et palette ⌘K

`cmdk` est déjà installé.

#### F11 — Fiches de détail en routes dédiées

`posts`, `orders`, `qr`, et alignement de `users` qui a déjà sa route. Les
dialogues d'**action** restent des dialogues.

---

### Lot 6 — Animations _(à détailler avant ouverture)_

#### F12 — Socle d'animation _(pilote)_

Ce que cette étape doit fixer, et qui liera les deux suivantes : le respect de
`prefers-reduced-motion` en un seul endroit, la frontière entre ce qui est fait
en CSS et ce qui justifie `motion`, le budget en kilooctets au premier rendu, et
les durées et courbes qui deviennent des jetons plutôt que des valeurs écrites à
la main.

#### F13 — Accueil et listes

#### F14 — Parcours et retours d'action

---

### Lot 7 — Assistant de recherche _(à détailler avant ouverture)_

#### F15 — Passerelle d'extraction et plafonds

Une route qui prend une phrase et rend des filtres. Ce que l'étape doit trancher
: le modèle (Haiku pour une extraction de cette nature), le plafond dédié dans
`rate-limit.policy.ts` — ce sera la route la plus chère de l'app —, l'accès
anonyme ou non, et le comportement quand la passerelle est injoignable ou non
configurée. Elle **échoue en repli**, jamais en panne : une recherche par
filtres reste possible.

#### F16 — Recherche par phrase, sans conversation

#### F17 — La conversation, et son repli

## 6. Questions encore ouvertes

Elles n'empêchent aucune étape de démarrer, mais elles se posent avant la
première PR de leur lot.

1. **Quel numéro WhatsApp pour le compte système ?** F2 en a besoin, et c'est
   une décision d'exploitation, pas de code.
2. **Commentaire et motif de modération : un canal ou deux ?** Par défaut deux,
   à confirmer en F3.
3. **L'assistant est-il ouvert aux visiteurs anonymes ?** Le plafond n'est pas
   le même, et l'ardoise non plus. À trancher en F15.
4. **Quel budget mensuel pour l'assistant ?** Il fixe le plafond, pas l'inverse.
