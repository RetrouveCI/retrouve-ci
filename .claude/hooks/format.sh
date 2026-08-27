#!/usr/bin/env bash
# PostToolUse(Write|Edit): format the file that was just written.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FILE_PATH="$(node "$ROOT/.claude/hooks/hook-input.mjs" file_path)"
if [[ -n "$FILE_PATH" ]]; then
  (cd "$ROOT" && pnpm exec prettier --write --ignore-unknown "$FILE_PATH" 2>/dev/null)
fi
exit 0
