import type { QrToken } from '../../types/qr.types'

const HEADERS = ['code', 'batch', 'status', 'createdAt'] as const

/** RFC 4180: a field holding a comma, a quote or a newline has to be quoted. */
function escapeField(value: string): string {
	return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function tokensToCsv(tokens: QrToken[]): string {
	const rows = tokens.map(token => [
		token.code,
		token.batch ?? '',
		token.status,
		token.createdAt,
	])

	return [HEADERS, ...rows]
		.map(row => row.map(escapeField).join(','))
		.join('\n')
}
