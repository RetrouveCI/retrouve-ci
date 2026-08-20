/**
 * French messages for the better-auth error codes the admin app can actually
 * hit. Everything else falls back to a generic message rather than surfacing an
 * English code to the user.
 *
 * Codes come from better-auth's `BASE_ERROR_CODES`; only the ones reachable
 * from an email/password sign-in or a password change are mapped.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: 'Email ou mot de passe incorrect',
	INVALID_EMAIL: 'Email invalide',
	INVALID_PASSWORD: 'Mot de passe incorrect',
	USER_NOT_FOUND: 'Aucun compte ne correspond à cet email',
	EMAIL_NOT_VERIFIED: "Cet email n'a pas encore été vérifié",
	ACCOUNT_NOT_FOUND: 'Aucun compte ne correspond à cet email',
	CREDENTIAL_ACCOUNT_NOT_FOUND:
		'Ce compte ne dispose pas de connexion par mot de passe',
	SESSION_EXPIRED: 'Votre session a expiré. Reconnectez-vous.',
	FAILED_TO_CREATE_SESSION: 'La session n’a pas pu être créée',
	PASSWORD_TOO_SHORT: 'Mot de passe trop court',
	PASSWORD_TOO_LONG: 'Mot de passe trop long',
}

export const DEFAULT_AUTH_ERROR_MESSAGE =
	'Une erreur est survenue. Veuillez réessayer.'

export function getAuthErrorMessage(code: string | undefined): string {
	if (!code) return DEFAULT_AUTH_ERROR_MESSAGE
	return AUTH_ERROR_MESSAGES[code] ?? DEFAULT_AUTH_ERROR_MESSAGE
}
