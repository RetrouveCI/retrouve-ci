---
name: unit-tests
description: Conventions de tests unitaires avec Vitest — tester le comportement (input → output) et non l'implémentation, couvrir cases / edge cases et toutes les branches, et co-localiser les tests dans des dossiers __tests__ miroir de la structure. À utiliser pour écrire, relire ou organiser des tests unitaires (.spec.ts) côté back (use-cases, mappers, validators) ou front.
---

# Tests unitaires — Vitest

## Principe : comportement, pas implémentation

Un test décrit **ce que fait** l'unité (sa promesse observable), jamais **comment** elle le fait.

- ✅ Tester ce qui entre et ce qui sort : `input → output`, valeur de retour, erreur levée, effet observable via l'API publique.
- ❌ Ne jamais tester des détails internes : méthodes privées, ordre d'appels internes, structure interne, nombre d'itérations.
- ✅ Un refactor qui préserve le comportement **ne doit casser aucun test**. Si renommer une variable privée casse un test, le test était couplé à l'implémentation.
- ❌ Pas d'assertion sur des mocks internes au seul but de « prouver » qu'une ligne a tourné. On mocke uniquement les **frontières** (dépendances injectées), pas l'unité testée.

## Quels cas écrire : input → output + branches

Dériver les cas **uniquement** des entrées/sorties et de l'arborescence de décision du code :

1. **Cas nominaux** : pour chaque forme d'`input` valide → l'`output` attendu.
2. **Edge cases** issus des entrées : vide, `null`/`undefined`, limites (0, négatif, max), collections vides/à un élément, doublons, valeurs aux bornes des `validators`.
3. **Branches** : couvrir **chaque branche** de l'arbre de contrôle (chaque `if`/`else`, `switch`, garde, court-circuit, chemin d'erreur/`throw`). Une branche non couverte = un cas manquant.

> La cible n'est pas « 100 % de lignes » mais « tout comportement et toute branche atteignables depuis les inputs ». Pas de test redondant qui ne couvre aucune nouvelle branche ni sortie.

## Emplacement : dossiers `__tests__` miroir

Tout test vit dans un dossier `__tests__/` **à côté** du fichier testé, avec le **même nom** + suffixe `.spec.ts` (requis pour la découverte Vitest).

```
domains/transactions/use-cases/
├── create-transaction.use-case.ts
└── __tests__/
    └── create-transaction.use-case.spec.ts
```

Règle générale : on teste `<dir>/<name>.ts` dans `<dir>/__tests__/<name>.spec.ts`. La structure des `__tests__` reflète exactement celle du code source.

- ✅ Un `__tests__/` par dossier de code testé, pas de dossier `test/` central pour les unitaires.
- ✅ Le nom du fichier de test reprend celui de la source (`*.use-case.spec.ts`, `*.mapper.spec.ts`, `*.validators.spec.ts`).
- ❌ Pas de test à la racine de la feature/domaine ni mélangé avec le code de prod.

Les profils Vitest (`@app/vitest-config`) incluent `src/**/*.spec.ts`, ce qui couvre les `__tests__/`.

## Quoi tester par couche

| Couche                    | Comportement à vérifier                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `use-cases/`              | Orchestration : pour un input donné + un repository factice, l'output/erreur attendu. Brancher chaque règle métier. |
| `mappers/`                | `DTO → ViewModel` (front) / `entité ↔ DTO` (back) : chaque champ transformé, formats, cas limites.                  |
| `validators/`             | Schémas `zod` : entrées valides acceptées, chaque entrée invalide rejetée (une par règle).                          |
| `helpers/` / `utils/`     | Fonctions pures : table de `input → output` + bornes.                                                               |
| front `loaders`/`actions` | Comportement observable (données chargées, mutation validée puis déléguée), pas l'implémentation du fetch.          |

## Forme d'un test

- Structure **Arrange / Act / Assert**, une intention de comportement par `it`.
- Nommer par le comportement : `it('rejette quand le montant est négatif')`, `describe('CreateTransactionUseCase')`.
- Injecter des **doubles aux frontières** via les interfaces du domaine (DIP) : un faux `repository` avec `vi.fn()`, pas l'infra réelle.
- `globals: true` est activé → `describe`/`it`/`expect`/`vi` sans import. `clearMocks` réinitialise les mocks entre tests.

```ts
import { CreateTransactionUseCase } from '../create-transaction.use-case'
import type { TransactionRepository } from '../../repository/transaction.repository'

describe('CreateTransactionUseCase', () => {
	const buildRepo = (): TransactionRepository => ({
		save: vi.fn(async (t) => t),
		findById: vi.fn(),
	})

	it('crée une transaction et retourne son id', async () => {
		const repo = buildRepo()
		const useCase = new CreateTransactionUseCase(repo)

		const result = await useCase.execute({ amount: 100, currency: 'EUR' })

		expect(result.id).toBeDefined()
	})

	it('lève TransactionAmountError quand le montant est négatif', async () => {
		const useCase = new CreateTransactionUseCase(buildRepo())

		await expect(
			useCase.execute({ amount: -1, currency: 'EUR' }),
		).rejects.toThrow('TransactionAmountError')
	})
})
```

## À éviter

- ❌ Mocker l'unité testée ou ses méthodes privées.
- ❌ Sur-mocker : si tout est mocké, le test ne vérifie plus de comportement.
- ❌ Tester du code tiers (NestJS, zod, React Router) — tester **notre** logique.
- ❌ Assertions sur l'ordre/nombre d'appels internes comme objectif du test.
- ❌ Tests non déterministes (dépendants de l'horloge, du réseau, d'un ordre d'exécution) — figer le temps/les dépendances.
