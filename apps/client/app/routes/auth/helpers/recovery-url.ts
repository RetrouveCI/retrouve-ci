import { withRedirect } from '@/shared/helpers/redirect'

/**
 * The recovery screens carry two things between them: the number a code was
 * sent to, and the `redirectTo` the visitor arrived with (invariant 2 of flow
 * E). `withRedirect` owns the second — sanitising included — so this only adds
 * the first.
 */
export function recoveryUrl(
	path: string,
	phoneNumber: string,
	redirectTo: string | null,
): string {
	const base = withRedirect(path, redirectTo)
	if (!phoneNumber) return base

	const separator = base.includes('?') ? '&' : '?'
	return `${base}${separator}phone=${encodeURIComponent(phoneNumber)}`
}
