export {
	ACCOUNT_WRITE_PATHS,
	PROTECTED_ACCOUNT_MESSAGE,
	accountWriteTarget,
	createAuth,
	enforcePasswordRule,
	getTrustedOrigins,
	hasRole,
	logSecretDelivery,
	refuseProtectedAccountWrite,
	refuseSignInWithoutRole,
	roleOf,
} from './auth.config'
export type { Auth, CreateAuthOptions, Session, User } from './auth.config'
