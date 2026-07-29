---
name: code-quality-review
description: Revue de code multi-axes (correctness, lisibilité, architecture, sécurité, performance) contre les conventions Arolitec (back/front, SOLID, clean code, qualité TS, dépendances, Turborepo, Docker). À utiliser avant tout merge pour relire un diff, une PR ou des fichiers — qu'ils soient écrits par toi, un autre agent ou un humain. Déclencher sur "review", "relis", "vérifie les conventions", "code review".
---

# Revue de code — qualité & conventions Arolitec

Relire le code modifié sur cinq axes et signaler chaque écart aux conventions. S'appuie sur les skills `backend-conventions`, `frontend-conventions`, `code-quality-setup`, `dependency-management`, `docker-conventions`.

## Standard d'approbation

Approuver un changement dès qu'il **améliore nettement la santé globale du code**, même imparfait. Le code parfait n'existe pas : l'objectif est l'amélioration continue. Ne pas bloquer un changement au seul motif qu'il diffère de la façon dont tu l'aurais écrit — s'il fait progresser le codebase et respecte les conventions du projet, l'approuver.

## Quand l'utiliser

- Avant tout merge de PR ou de changement.
- Après l'implémentation d'une feature ou un refactoring.
- Pour évaluer du code produit par toi, un autre agent ou un humain — le code généré par IA mérite **plus** de scrutin, pas moins.
- Après un bug fix (relire le fix **et** le test de non-régression).

## Procédure

1. **Cadrer le périmètre.** Par défaut, revoir le diff par rapport à `main` :
   ```bash
   git diff --stat origin/main...HEAD   # ou: git diff main
   ```
   Sinon, revoir les fichiers/PR indiqués par l'utilisateur.
2. **Comprendre l'intention** avant de lire le code : que vise ce changement, quelle spec/tâche, quel comportement attendu.
3. **Relire les tests d'abord** — ils révèlent l'intention et la couverture (comportement testé, pas l'implémentation ; cases + edge cases ; noms parlants ; attraperaient-ils une régression).
4. **Classer chaque fichier** par couche (back `domains/infrastructures/presentations/shared`, front `features/.../servers/...`, config, docker).
5. **Dérouler les cinq axes** et les checklists ci-dessous.
6. **Restituer** un rapport groupé par sévérité (voir plus bas). Pour chaque point : `fichier:ligne`, la règle enfreinte, et la correction attendue.

## Principes directeurs (justifier tout écart par au moins un)

Rapidité · Scalabilité · Modificabilité · Simplicité · Auditabilité · Sécurité.

## Les cinq axes de revue

### 1. Correctness

Le code fait-il ce qu'il prétend ? Conforme à la spec ; edge cases gérés (null, vide, bornes) ; chemins d'erreur traités (pas que le happy path) ; pas d'off-by-one, race condition, état incohérent ; les tests passent et testent la bonne chose.

### 2. Lisibilité & simplicité

Un autre ingénieur (ou agent) comprend-il sans explication ? Voir checklist **Clean Code**. Pointer notamment : noms parlants, flux de contrôle direct, abstractions qui méritent leur complexité (ne pas généraliser avant le 3ᵉ cas d'usage), `1000` lignes là où `100` suffisent = échec, pas d'artefacts de code mort.

### 3. Architecture

Le changement s'inscrit-il dans le design du système ? Voir checklists **Back-end**, **Front-end**, **SOLID**. Suit les patterns existants (un nouveau pattern doit être justifié), frontières de modules nettes, pas de duplication à factoriser, sens des dépendances correct (pas de cycle), niveau d'abstraction adapté.

### 4. Sécurité

Inputs validés/sanitisés aux frontières ; pas de secret dans le code, les logs ou le VCS ; auth/autorisation vérifiées ; requêtes paramétrées (pas de concaténation SQL) ; sorties encodées (anti-XSS) ; données externes (API, config, contenu utilisateur) traitées comme **non fiables**. Pour une revue sécurité approfondie, utiliser `/security-review`.

### 5. Performance

Pas de N+1 ; pas de boucle ni de fetch non borné ; pas d'opération synchrone qui devrait être async ; pas de re-render UI inutile ; pagination sur les endpoints de liste. **Quantifier** quand c'est possible (« ce N+1 ajoute ~50 ms par item »).

## Checklist Back-end (`backend-conventions`)

Architecture en 4 zones : `domains/` · `infrastructures/` · `presentations/` · `shared/`.

- [ ] Sens des dépendances respecté : flèches **toujours vers `domains/`**.
- [ ] `domains/` ne dépend ni d'une lib externe ni de `infrastructures/` / `presentations/`.
- [ ] Chaque domaine est un **module NestJS indépendant** (`*.module.ts`).
- [ ] Aucune logique métier ni logique conditionnelle dans un controller — il délègue à un `use-case`.
- [ ] Aucune requête DB hors `infrastructures/` (passe par une interface `repository/` du domaine).
- [ ] `infrastructures/` implémente toujours une interface déclarée dans `domains/` ; un `.config.ts` par service externe.
- [ ] Validation des inputs HTTP via les `validators/` du domaine.
- [ ] Erreurs métier dans `domains/<domain>/errors/`, étendant `DomainError`.
- [ ] Helper métier dans `domains/<domain>/helpers/` ; `shared/helpers` = couplé app non-métier, `shared/utils` = technique réutilisable.
- [ ] Pas de `use-case` instancié dans un autre `use-case`.
- [ ] `presentations/<feature-name>/` regroupe controllers/workers/queue-consumers cohérents.
- [ ] Nommage : `*.repository.ts`, `*.mapper.ts`, `create-*.use-case.ts`, `*.validator.ts`, `*.errors.ts`, `*.module.ts`.

## Checklist Front-end (`frontend-conventions`)

Architecture Feature-based : `features/[feature]/` + `shared/`.

- [ ] Aucun `fetch` hors `servers/` — composants et hooks passent par `servers/*.service.ts`.
- [ ] Un composant reçoit un **ViewModel** (via `mapper`), jamais un DTO brut.
- [ ] Aucune logique de transformation dans un composant → `mapper`.
- [ ] `*.actions.ts` valident l'input avec le schéma `zod` de la feature avant l'appel service.
- [ ] Validation `zod` partagée entre formulaire client et `*.actions.ts`.
- [ ] Type/composant/constante réutilisé entre features → `shared/types` · `shared/components` · `shared/constants`, pas dans une feature.
- [ ] Loaders/actions conformes React Router v7 ; `index.tsx` expose la page/routeur de la feature.
- [ ] Nommage : composants `kebab-case.tsx`, hooks préfixés `use`, `[feature].service|loader|actions|validators|types|const.ts`.

## Checklist SOLID

- [ ] **S**RP — une classe/fonction/module a **une seule raison de changer** (un use-case = une intention ; un controller ne fait que router ; un mapper ne fait que mapper).
- [ ] **O**CP — extension sans modification : préférer une nouvelle implémentation d'interface plutôt que modifier le cœur ; pas de `switch`/`if` géant sur un type qui grossit à chaque cas.
- [ ] **L**SP — toute implémentation d'une interface `repository`/service est substituable sans casser l'appelant (mêmes contrats, pas d'exception surprise).
- [ ] **I**SP — interfaces fines et ciblées ; pas d'interface fourre-tout que les implémentations remplissent à moitié.
- [ ] **D**IP — les `use-cases` dépendent d'**abstractions** (`repository/` interface), jamais d'une implémentation `infrastructures/` concrète ; injection via le module NestJS.

## Checklist Clean Code

- [ ] Nommage intentionnel : noms révélateurs, pas d'abréviations obscures ni de `data`/`tmp`/`x`.
- [ ] Fonctions courtes, **un seul niveau d'abstraction**, font une seule chose.
- [ ] **≤ 3 paramètres** par fonction (au-delà → objet de paramètres). Aligné sur `max-params` ESLint.
- [ ] Pas de paramètre booléen pilotant deux comportements → scinder en deux fonctions.
- [ ] Pas de duplication (DRY) ; factoriser dans un helper/util adapté à sa couche.
- [ ] Pas de nombres/chaînes magiques → constantes nommées (`*.const.ts`).
- [ ] Imbrication limitée : early-return / guard clauses plutôt que `if` profonds.
- [ ] Pas de code mort, commenté, ni de `console.log` oublié.
- [ ] **Pas de commentaire** par défaut : le code doit être auto-explicatif (noms clairs, fonctions courtes). Un commentaire n'est justifié **que** pour le **pourquoi** d'un choix non évident (contrainte métier, contournement, décision d'archi), jamais pour paraphraser le quoi.
- [ ] Gestion d'erreur explicite (erreurs typées), pas de `catch` vide ni avalé.
- [ ] Effets de bord isolés et prévisibles ; privilégier des fonctions pures dans `helpers/`.

## Checklist Qualité du code (TS — `code-quality-setup`)

- [ ] `strict: true` respecté ; pas de contournement de types.
- [ ] Pas de `any` (sauf cas documenté), pas de `as`, pas de `// @ts-ignore` (utiliser `// @ts-expect-error` + justification).
- [ ] `import type` pour les imports de types ; retours des fonctions publiques typés.
- [ ] `import/order` et `import/no-cycle` respectés (pas de dépendance circulaire).
- [ ] Configs lint/tsconfig/vitest consommées depuis les packages partagés — pas de duplication ni config Prettier locale.
- [ ] Pas de débat de style : Prettier décide (config racine).

## Checklist Dépendances (`dependency-management`)

Toute dépendance est une dette. Avant d'en ajouter une : le stack existant ne suffit-il pas ? taille/bundle ? activement maintenue ? vulnérabilités connues (`npm audit`/`pnpm audit`) ? licence compatible ?

- [ ] Dep utilisée dans ≥ 2 packages → déclarée en `catalog:`.
- [ ] Pas de version en dur pour une dep partagée, pas de `*`/`latest`.
- [ ] Nouvelle dépendance npm → signaler (validation Squad Lead requise).

## Checklist Turborepo / Docker (si concerné)

- [ ] Tâches via scripts racine + `--filter` ; pas de `cd app && build`.
- [ ] `outputs` déclarés pour le cache ; `dev`/`clean` en `cache: false`.
- [ ] Dockerfile multi-stage, `node:24-alpine`, `USER node`, `HEALTHCHECK`, `--frozen-lockfile`, pas de `COPY . .` final, pas de secret.
- [ ] Aucun `.env` avec de vraies valeurs commité (`.env.example` à jour).

## Taille des changements

Petit, focalisé, plus sûr. Cibles indicatives : **~100 lignes** = idéal (revue en une fois) · **~300** = acceptable pour un seul changement logique · **~1000** = trop gros, **à découper**.

- Séparer **refactoring** et **ajout de comportement** : ce sont deux changements distincts.
- Découper : par dépendance (stack), par groupe de fichiers, horizontalement (code partagé d'abord) ou verticalement (tranches full-stack).
- Acceptable en gros volume : suppressions complètes de fichiers et refactorings automatisés où il suffit de vérifier l'intention.

## Catégoriser les findings

Étiqueter chaque remarque pour distinguer le requis de l'optionnel :

| Sévérité                | Sens                                                                              | Action auteur          |
| ----------------------- | --------------------------------------------------------------------------------- | ---------------------- |
| 🔴 **Bloquant**         | Viole une règle absolue, faille sécurité, perte de données, fonctionnalité cassée | À corriger avant merge |
| 🟠 **À corriger**       | Écart aux conventions requis                                                      | À traiter avant merge  |
| 🟡 **Suggestion / Nit** | Mineur, style, préférence                                                         | L'auteur peut ignorer  |
| ℹ️ **FYI**              | Informatif, contexte futur                                                        | Aucune action          |

## Hygiène du code mort

Après tout refactoring/implémentation, repérer le code orphelin. Le **lister explicitement** puis **demander avant de supprimer** — ne jamais effacer en silence ce dont on n'est pas sûr.

```
CODE MORT IDENTIFIÉ :
- formatLegacyDate() dans src/utils/date.ts — remplacé par formatDate()
- constante LEGACY_API_URL — plus aucune référence
→ OK pour les supprimer ?
```

## Honnêteté en revue

- **Ne pas tamponner.** Un « LGTM » sans preuve de revue n'aide personne.
- **Ne pas édulcorer** un vrai problème : un bug qui partira en prod n'est pas « une préoccupation mineure ».
- **Quantifier** quand c'est possible (latence, taille, occurrences).
- **Contester** les approches à problème évident et proposer une alternative — la complaisance est un mode d'échec.
- **Accepter l'override avec grâce** : si l'auteur a tout le contexte et tranche autrement, déférer. Commenter le code, pas la personne.
- **Ne pas accepter « je nettoierai plus tard »** : exiger le nettoyage avant merge, ou ouvrir un ticket auto-assigné.

## Points à escalader au Squad Lead

Nouveau dossier racine dans `src/`, nouvelle dépendance npm, doute sur la couche responsable, ou pattern hors conventions.

## Verdict

- **Approuver** — améliore la santé du code, conventions respectées, 🔴/🟠 traités.
- **Demander des changements** — au moins un 🔴/🟠 ouvert. Lister précisément ce qui bloque.
