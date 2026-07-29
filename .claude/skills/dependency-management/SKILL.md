---
name: dependency-management
description: Gestion des dépendances du monorepo via le catalog pnpm (source de vérité unique des versions). À utiliser pour ajouter, mettre à jour ou auditer une dépendance, ou pour décider entre catalog et version locale dans un package.json.
---

# Gestion des dépendances — catalog pnpm

Le **catalog pnpm** est la source de vérité unique pour les versions des dépendances partagées. Une seule ligne à changer dans `pnpm-workspace.yaml` met à jour une dépendance partout.

## Déclaration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

catalog:
  typescript: '^5.5.0'
  zod: '^3.23.0'
  # back-end, front-end, qualité du code...
  eslint: '^9.0.0'
  prettier: '^3.3.0'
```

## Usage dans un package.json

```json
{
	"dependencies": { "zod": "catalog:", "@nestjs/core": "catalog:" },
	"devDependencies": { "typescript": "catalog:", "eslint": "catalog:" }
}
```

## Mettre à jour

```bash
# 1. Modifier la version dans pnpm-workspace.yaml
# 2. pnpm install
pnpm outdated --recursive   # voir les mises à jour disponibles
```

## Règles

- ✅ Toute dépendance utilisée dans **≥ 2 packages** doit être dans le catalog.
- ✅ Utiliser le protocole `"catalog:"` — jamais la version en dur pour une dep partagée.
- ✅ Pour mettre à jour une dep partagée : modifier `pnpm-workspace.yaml` uniquement, puis `pnpm install`.
- ✅ `pnpm install --frozen-lockfile` en CI.
- ❌ Jamais deux versions différentes d'une même lib sans validation Squad Lead.
- ❌ Jamais `*` ou `latest` — toujours une version sémantique avec range (`^`).
- ❌ Ne pas `pnpm add` sans vérifier si la dep devrait être dans le catalog.

### Dépendance utilisée par un seul package

Elle peut rester en version en dur dans son `package.json`. Le catalog est réservé aux dépendances partagées.

> ⚠️ Ajouter une **nouvelle dépendance npm** nécessite la validation du Squad Lead.
