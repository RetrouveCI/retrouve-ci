#!/usr/bin/env bash
# PostToolUse(Write|Edit): typecheck the monorepo after a TypeScript file changes.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FILE_PATH="$(node "$ROOT/.claude/hooks/hook-input.mjs" file_path)"
if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
  (cd "$ROOT" && pnpm run check-types 2>&1)
fi
exit 0
