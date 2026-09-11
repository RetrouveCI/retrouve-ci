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
export function enforcePasswordRule(path: string, body: unknown): void {
	if (path !== '/admin/create-user') return

	const { password } = (body ?? {}) as { password?: unknown }
	const result = passwordSchema.safeParse(password)

	if (!result.success) {
		throw new APIError('BAD_REQUEST', {
			message: result.error.issues[0]?.message ?? 'Mot de passe invalide',
		})
	}
}

/** better-auth stores a user's roles as one comma-separated string. */
export function hasRole(
	role: string | null | undefined,
	required: readonly string[],
): boolean {
	const held = (role ?? '').split(',').map(value => value.trim())

	return required.some(name => held.includes(name))
}

/**
 * Word for word what better-auth answers on a bad sign-in, code included. An
 * instance that refuses an account for its role must be indistinguishable from
 * one refusing a wrong password, or the refusal itself says the account exists.
 * Hard-coded rather than imported: `BASE_ERROR_CODES` lives in
 * `@better-auth/core`, a dependency this package does not otherwise carry.
 */
const INVALID_CREDENTIALS = {
	code: 'INVALID_EMAIL_OR_PASSWORD',
	message: 'Invalid email or password',
} as const

type SignInBody = { email?: unknown; password?: unknown }

/**
 * The role off a user row. `role` is the `admin()` plugin's own column, so the
 * adapter returns it — measured against a real row — while better-auth's static
 * `User` does not carry it. A row without one is refused like a missing row:
 * both mean « holds no role this instance requires ».
 */
export function roleOf(user: object | null | undefined): string | null {
	if (!user || !('role' in user)) return null

	return typeof user.role === 'string' ? user.role : null
}

/**
 * Closes an instance to accounts that do not hold one of its roles. Nothing
 * else refuses them: every visitor holds a password account — a phone sign-up
 * mints one under `<number>@phone.…` — and both instances expose
 * `/sign-in/email` from the shared core, so the backoffice's cookie could be
 * obtained by anyone who has an account at all.
 *
 * It hashes the password before refusing, exactly as better-auth does for an
 * unknown email, so the answer costs the same whether the account is missing,
 * not an administrator, or simply mistyped its password.
 */
export async function refuseSignInWithoutRole(
	path: string,
	body: unknown,
	requiredRoles: readonly string[],
	findRoleByEmail: (email: string) => Promise<string | null>,
	hashPassword: (password: string) => Promise<unknown>,
): Promise<void> {
	if (!requiredRoles.length || path !== '/sign-in/email') return

	const { email, password } = (body ?? {}) as SignInBody
	// Not an email at all: better-auth answers its own bad request.
	if (typeof email !== 'string' || !email) return

	if (hasRole(await findRoleByEmail(email), requiredRoles)) return

	if (typeof password === 'string') await hashPassword(password)

	throw new APIError('UNAUTHORIZED', INVALID_CREDENTIALS)
}

/**
 * The `admin()` routes that act on another account, each naming it by `userId`.
 * Removing one cascades to everything it owns, changing its email loses the
 * lookup that finds it, and impersonating it hands out its listings.
 */
export const ACCOUNT_WRITE_PATHS = [
	'/admin/remove-user',
	'/admin/ban-user',
	'/admin/set-role',
	'/admin/set-user-password',
	'/admin/impersonate-user',
	'/admin/update-user',
] as const

export const PROTECTED_ACCOUNT_MESSAGE =
	"Ce compte appartient à l'équipe RetrouveCI : il porte ses annonces et ne peut être ni supprimé, ni banni, ni modifié."

/** The account a request acts on, when it is one of those routes. */
export function accountWriteTarget(
	path: string,
	body: unknown,
): string | undefined {
	if (!(ACCOUNT_WRITE_PATHS as readonly string[]).includes(path))
		return undefined

	// better-auth coerces the id to a string, so a number must not slip past.
	const { userId } = (body ?? {}) as { userId?: unknown }
	if (typeof userId !== 'string' && typeof userId !== 'number') return undefined

	return String(userId) || undefined
}

type FindUserById = (id: string) => Promise<{ email: string } | null>

/**
 * Refuses a write on a protected account. Checked on the stored email rather
 * than on an id the package cannot know, which is sound because
 * `/admin/update-user` is one of the refused routes: the email cannot move.
 */
export async function refuseProtectedAccountWrite(
	path: string,
	body: unknown,
	protectedEmails: readonly string[],
	findUserById: FindUserById,
): Promise<void> {
	if (!protectedEmails.length) return

	const target = accountWriteTarget(path, body)
	if (!target) return

	const user = await findUserById(target)

	if (user && protectedEmails.includes(user.email.toLowerCase())) {
		throw new APIError('FORBIDDEN', { message: PROTECTED_ACCOUNT_MESSAGE })
	}
}

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
	/**
	 * Accounts no administrator may remove, ban, re-role, re-password,
	 * impersonate or edit. These routes are middleware mounted before any
	 * framework guard, so this hook is the only place the refusal can live.
	 */
	protectedEmails?: string[]
	/**
	 * Roles an account must hold to sign in on this instance at all. Empty — the
	 * default — lets any account in, which is what the public app wants.
	 */
	requiredRoles?: string[]
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
		protectedEmails = [],
		requiredRoles = [],
	}: CreateAuthOptions = {},
) {
	const guardWrites = createAuthMiddleware(async ctx => {
		enforcePasswordRule(ctx.path, ctx.body)
		await refuseSignInWithoutRole(
			ctx.path,
			ctx.body,
			requiredRoles,
			async email => {
				const found = await ctx.context.internalAdapter.findUserByEmail(email)
				return roleOf(found?.user)
			},
			password => ctx.context.password.hash(password),
		)
		await refuseProtectedAccountWrite(
			ctx.path,
			ctx.body,
			protectedEmails.map(email => email.toLowerCase()),
			id => ctx.context.internalAdapter.findUserById(id),
		)
	})

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
		hooks: { before: guardWrites },
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
