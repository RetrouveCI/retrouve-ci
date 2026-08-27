import {
	type BetterAuthOptions,
	type BetterAuthPlugin,
	betterAuth,
} from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { admin } from 'better-auth/plugins'
import {
	PASSWORD_MAX_LENGTH,
	PASSWORD_MIN_LENGTH,
	passwordSchema,
} from '@app/contracts/shared'

type PrismaClient = Parameters<typeof prismaAdapter>[0]

const DEFAULT_APP_NAME = 'retrouveci'

const DEFAULT_TRUSTED_ORIGINS = [
	'http://localhost:3000',
	'http://localhost:3001',
]

export function getTrustedOrigins(
	env: NodeJS.ProcessEnv = process.env,
): string[] {
	const configuredOrigins = env['BETTER_AUTH_TRUSTED_ORIGINS']
		?.split(',')
		.map(origin => origin.trim())
		.filter(Boolean)

	if (configuredOrigins?.length) return configuredOrigins

	return env['NODE_ENV'] === 'production' ? [] : DEFAULT_TRUSTED_ORIGINS
}

/** Where an OTP or a reset link goes until a mailer and an SMS gateway exist. */
export function logSecretDelivery(
	kind: string,
	recipient: string,
	secret: string,
): void {
	if (process.env['NODE_ENV'] === 'production') {
		console.warn(`[auth] ${kind} delivery is not configured for ${recipient}`)
		return
	}

	console.log(`[auth] ${kind} for ${recipient}: ${secret}`)
}

/**
 * `admin/create-user` is the one password write better-auth leaves unbounded —
 * every other path checks `minPasswordLength` itself. Without this the rule the
 * backoffice form states would be advisory, and an admin could be created with
 * a password they could never reset to.
 */
const enforcePasswordRule = createAuthMiddleware(ctx => {
	if (ctx.path !== '/admin/create-user') return Promise.resolve()

	const { password } = (ctx.body ?? {}) as { password?: unknown }
	const result = passwordSchema.safeParse(password)

	if (!result.success) {
		throw new APIError('BAD_REQUEST', {
			message: result.error.issues[0]?.message ?? 'Mot de passe invalide',
		})
	}

	return Promise.resolve()
})

export interface CreateAuthOptions {
	appName?: string
	basePath?: string
	/**
	 * Names the session cookie. Two instances need two prefixes to hold two
	 * independent cookies — `appName` does **not** set this, despite what the
	 * option's documentation suggests: the default is the literal `better-auth`.
	 */
	cookiePrefix?: string
	/** Parent domain for the session cookie, e.g. `.example.com`. */
	cookieDomain?: string
	plugins?: BetterAuthPlugin[]
	trustedOrigins?: string[]
}

export function createAuth(
	prisma: PrismaClient,
	{
		appName = DEFAULT_APP_NAME,
		basePath,
		cookiePrefix,
		cookieDomain,
		plugins = [],
		trustedOrigins,
	}: CreateAuthOptions = {},
) {
	const advanced = {
		...(cookiePrefix ? { cookiePrefix } : {}),
		...(cookieDomain
			? { crossSubDomainCookies: { enabled: true, domain: cookieDomain } }
			: {}),
	}

	return betterAuth({
		appName,
		...(basePath ? { basePath } : {}),
		...(Object.keys(advanced).length ? { advanced } : {}),
		database: prismaAdapter(prisma, { provider: 'postgresql' }),
		secret: process.env['BETTER_AUTH_SECRET'],
		baseURL: process.env['BETTER_AUTH_URL'],
		trustedOrigins: trustedOrigins?.length
			? trustedOrigins
			: getTrustedOrigins(),
		emailAndPassword: {
			enabled: true,
			minPasswordLength: PASSWORD_MIN_LENGTH,
			maxPasswordLength: PASSWORD_MAX_LENGTH,
			sendResetPassword: ({ user, url }) => {
				logSecretDelivery('Password reset', user.email, url)
				return Promise.resolve()
			},
		},
		hooks: { before: enforcePasswordRule },
		user: {
			additionalFields: {
				city: { type: 'string', required: false, input: true },
				commune: { type: 'string', required: false, input: true },
			},
			deleteUser: { enabled: true },
		},
		plugins: [
			admin({ defaultRole: 'user', adminRoles: ['admin'] }),
			...plugins,
		],
	} satisfies BetterAuthOptions)
}

export type Auth = ReturnType<typeof createAuth>
export type Session = Auth['$Infer']['Session']
export type User = Session['user']
