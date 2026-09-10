export const DEFAULT_SYSTEM_ACCOUNT_EMAIL = 'equipe@retrouveci.ci'

/**
 * The one rule for the system account's address. Three readers need it — the
 * seeder that creates the account, the service that finds it, and the auth hook
 * that protects it — and they must agree: a seeder that kept `'  '` while the
 * service fell back would create an account nobody could find again.
 */
export function resolveSystemAccountEmail(raw: string | undefined): string {
	// better-auth lowercases an email at sign-up, so a mixed-case variable would
	// create an account the other two readers could never find.
	return raw?.trim().toLowerCase() || DEFAULT_SYSTEM_ACCOUNT_EMAIL
}
