export {
	ACCOUNT_WRITE_PATHS,
	PROTECTED_ACCOUNT_MESSAGE,
	accountWriteTarget,
	createAuth,
	enforcePasswordRule,
	getTrustedOrigins,
	logSecretDelivery,
	refuseProtectedAccountWrite,
} from './auth.config'
export type { Auth, CreateAuthOptions, Session, User } from './auth.config'
