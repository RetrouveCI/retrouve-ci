// Reads the hook payload on stdin and prints one requested field.
// Usage: node hook-input.mjs file_path | command
// Replaces the `jq` calls used by the upstream reference hooks (jq is not
// guaranteed to be installed; node always is, since this is a pnpm monorepo).
const field = process.argv[2]

let raw = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  raw += chunk
})
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(raw).tool_input ?? {}
    const value =
      field === 'file_path'
        ? (input.file_path ?? input.notebook_path ?? '')
        : (input[field] ?? '')
    process.stdout.write(String(value))
  } catch {
    // Malformed payload: print nothing so the caller skips its work.
  }
})
