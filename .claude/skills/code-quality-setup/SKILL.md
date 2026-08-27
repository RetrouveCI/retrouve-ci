---
name: code-quality-setup
description: Configs ESLint / Prettier / TypeScript / Vitest partagées du monorepo (approche Turborepo) et règles TypeScript transversales. À utiliser pour créer/modifier les configs lint, tsconfig ou vitest, ajouter un profil (nest/react/vite), ou vérifier le respect des règles TS (strict, pas de any/as/@ts-ignore, import type).
---

# Qualité du code — configs partagées

Une seule source de vérité, zéro duplication. Les configs d'outillage sont centralisées dans des packages internes consommés par chaque app/package en `workspace:*`.

```
packages/
├── eslint-config/        # Configs ESLint par profil
├── typescript-config/    # Configs TypeScript par profil
└── vitest-config/        # Configs Vitest par profil
```

## `packages/eslint-config/`

Un package, plusieurs profils. Exports : `./base`, `./nest`, `./react`.

- `base.js` — règles communes : `js.configs.recommended`, `tseslint.configs.recommendedTypeChecked`, `eslint-config-prettier`, plugin `import`. Inclut les règles `no-explicit-any`, `no-unused-vars` (`argsIgnorePattern: '^_'`), `consistent-type-imports`, `explicit-function-return-type`, `import/order`, `import/no-cycle`, `eqeqeq`, `prefer-const`, `no-var`. Ignore `dist/`, `node_modules/`, `.turbo/`, `coverage/`.
- `nest.js` — étend `base`. Adapte pour NestJS (décorateurs) : `ignoreRestSiblings`, `explicit-function-return-type: off`.
- `react.js` — étend `base`. Ajoute `eslint-plugin-react` + `react-hooks`, `react/react-in-jsx-scope: off`, `react/prop-types: off`.

Chaque app consomme son profil et passe son `parserOptions.project` / `tsconfigRootDir` local dans son `eslint.config.mjs`.

## `packages/typescript-config/`

Profils : `base.json`, `nest.json`, `vite.json`, `library.json`.

- `base.json` — `target ES2022`, `strict: true`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes`, declaration/sourceMap, `esModuleInterop`, `forceConsistentCasingInFileNames`.
- `nest.json` — `module CommonJS`, `emitDecoratorMetadata`, `experimentalDecorators`, `strictPropertyInitialization: false`.
- `vite.json` — `module ESNext`, `moduleResolution Bundler`, `jsx react-jsx`, lib DOM, `noEmit`.
- `library.json` — `module NodeNext`, `composite: true` (project references Turborepo).

Chaque app `extends` son profil et n'ajoute que `outDir`/`rootDir`/`baseUrl`/`paths`.

## `packages/vitest-config/`

Un package, plusieurs profils. Exports : `./base`, `./node`, `./react`.

```
packages/vitest-config/
├── package.json
├── base.js       # Config commune à tous les tests
├── node.js       # Environnement node (back-end NestJS)
└── react.js      # Environnement jsdom (front React)
```

- `base.js` — config commune via `defineConfig` : `globals: true`, `clearMocks: true`, `passWithNoTests: true`, coverage `v8` (`reporter: ['text', 'json', 'html']`, `reportsDirectory: './coverage'`). Pas de `include` ici — chaque app définit son périmètre (sinon `mergeConfig` concatène les globs).
- `node.js` — étend `base` via `mergeConfig`. `environment: 'node'` + plugin `unplugin-swc` (émet les metadata des décorateurs pour la DI NestJS).
- `react.js` — étend `base` via `mergeConfig`. `environment: 'jsdom'`.

Exemple `base.js` :

```js
import { defineConfig } from 'vitest/config'

export const baseConfig = defineConfig({
	test: {
		globals: true,
		clearMocks: true,
		passWithNoTests: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			reportsDirectory: './coverage',
		},
	},
})
```

> Apps en CommonJS (NestJS) : nommer le fichier `vitest.config.mts` pour qu'il soit chargé en ESM (le package `@app/vitest-config` est ESM-only).

Profil `node.js` :

```js
import { defineConfig, mergeConfig } from 'vitest/config'
import { baseConfig } from './base.js'

export const nodeConfig = mergeConfig(
	baseConfig,
	defineConfig({ test: { environment: 'node' } }),
)
```

Chaque app crée un `vitest.config.ts` minimal qui ré-exporte son profil :

```ts
import { nodeConfig } from '@app/vitest-config/node' // ou reactConfig depuis /react
export default nodeConfig
```

Règles :

- ✅ Une seule config Vitest par profil, partagée — aucune config dupliquée dans les apps.
- ✅ La tâche Turborepo `test` met en cache sur `src/**`, `test/**` et `vitest.config.ts`.
- ❌ Ne pas redéfinir `coverage`/`environment` dans une app sans raison — étendre le profil.

## Prettier

Une seule config à la **racine** du monorepo — aucune config Prettier locale dans les apps/packages.
`.prettierrc` : `semi: false`, `singleQuote: true`, `trailingComma: all`, `printWidth: 100`, `tabWidth: 2`, `arrowParens: avoid`, `endOfLine: lf`. `eslint-config-prettier` est inclus dans `base.js`.

## Règles TypeScript transversales

- ✅ `strict: true` non-négociable.
- ✅ Typer explicitement le retour des fonctions publiques (use-cases, services, mappers).
- ✅ `import type` pour les imports de types uniquement.
- ✅ `type` pour les données, `interface` pour les contrats extensibles.
- ❌ `any` interdit sauf cas documenté (API externe non typée).
- ❌ `as` (assertion) interdit — valider via un mapper ou Zod.
- ❌ `// @ts-ignore` interdit — utiliser `// @ts-expect-error` avec justification.

```ts
// ✅ validation Zod au lieu d'une assertion
const user = userSchema.parse(rawResponse.data)
// ❌ const user = rawResponse.data as User
```
