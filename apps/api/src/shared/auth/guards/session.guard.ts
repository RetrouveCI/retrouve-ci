import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Inject,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { fromNodeHeaders } from 'better-auth/node'
import type { AdminAuth, Auth } from '@/infrastructures/auth/auth.config'
import { ADMIN_AUTH, CLIENT_AUTH } from '@/infrastructures/auth/auth.tokens'
import {
	AUDIENCE_HEADER,
	getAdminOrigins,
	resolveAudience,
} from '@/shared/auth/session-audience'

// Metadata keys `@AllowAnonymous()`, `@OptionalAuth()` and `@Roles()` set.
const PUBLIC_KEY = 'PUBLIC'
const OPTIONAL_KEY = 'OPTIONAL'
const ROLES_KEY = 'ROLES'

interface RequestLike {
	headers?: Record<string, string | string[] | undefined>
	session?: unknown
	user?: unknown
}

type SessionLike = { user?: { role?: string | null } } | null

/**
 * Replaces the guard `@thallesp/nestjs-better-auth` registers, because the choice
 * of which better-auth instance to read belongs here: the two apps hold separate
 * cookies, and the browser sends both.
 */
@Injectable()
export class SessionGuard implements CanActivate {
	private readonly adminOrigins = getAdminOrigins()

	constructor(
		private readonly reflector: Reflector,
		@Inject(CLIENT_AUTH) private readonly clientAuth: Auth,
		@Inject(ADMIN_AUTH) private readonly adminAuth: AdminAuth,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (context.getType() !== 'http') return true

		const request = context.switchToHttp().getRequest<RequestLike>()
		const headers = fromNodeHeaders(request.headers ?? {})

		const audience = resolveAudience({
			origin: readHeader(request, 'origin'),
			audienceHeader: readHeader(request, AUDIENCE_HEADER),
			adminOrigins: this.adminOrigins,
		})

		const auth = audience === 'admin' ? this.adminAuth : this.clientAuth
		const session = (await auth.api.getSession({ headers })) as SessionLike

		request.session = session
		request.user = session?.user ?? null

		if (this.metadata<boolean>(context, PUBLIC_KEY)) return true

		if (!session) {
			if (this.metadata<boolean>(context, OPTIONAL_KEY)) return true
			throw new UnauthorizedException()
		}

		const requiredRoles = this.metadata<string[]>(context, ROLES_KEY)
		if (requiredRoles?.length && !hasRole(session, requiredRoles)) {
			throw new ForbiddenException()
		}

		return true
	}

	private metadata<T>(context: ExecutionContext, key: string): T | undefined {
		return this.reflector.getAllAndOverride<T>(key, [
			context.getHandler(),
			context.getClass(),
		])
	}
}

function hasRole(session: SessionLike, requiredRoles: string[]): boolean {
	const roles = (session?.user?.role ?? '').split(',').map(role => role.trim())
	return requiredRoles.some(required => roles.includes(required))
}

function readHeader(request: RequestLike, name: string): string | undefined {
	const value = request.headers?.[name]
	return Array.isArray(value) ? value[0] : value
}
