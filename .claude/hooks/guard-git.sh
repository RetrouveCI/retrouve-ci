#!/usr/bin/env bash
# PreToolUse(Bash): block destructive git commands without explicit approval.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMMAND="$(node "$ROOT/.claude/hooks/hook-input.mjs" command)"
if echo "$COMMAND" | grep -qE '^git[[:space:]]+push[[:space:]]+.*(--force|-f)|^git[[:space:]]+reset[[:space:]]+--hard|^git[[:space:]]+clean[[:space:]]+-f'; then
  echo 'Blocked: destructive git command requires explicit user approval' >&2
  exit 2
fi
exit 0
