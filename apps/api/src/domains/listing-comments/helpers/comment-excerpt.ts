const EXCERPT_LENGTH = 120

// A notice quotes the comment rather than carrying it whole: a push is read on
// a lock screen.
export function commentExcerpt(body: string): string {
	const line = body.replace(/\s+/g, ' ').trim()

	return line.length <= EXCERPT_LENGTH
		? line
		: `${line.slice(0, EXCERPT_LENGTH - 1).trimEnd()}…`
}
